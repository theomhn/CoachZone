<?php

namespace App\Repository;

use App\Entity\OpenData;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<OpenData>
 */
class OpenDataRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, OpenData::class);
    }

    /**
     * Trouve les données OpenData par ville
     */
    public function findByCity(string $city): array
    {
        return $this->createQueryBuilder('o')
            ->andWhere('o.instComNom = :city OR o.newName = :city')
            ->setParameter('city', $city)
            ->orderBy('o.instNom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les données OpenData par type d'équipement
     */
    public function findByEquipmentType(string $equipmentType): array
    {
        return $this->createQueryBuilder('o')
            ->andWhere('o.equipTypeName LIKE :type')
            ->setParameter('type', '%' . $equipmentType . '%')
            ->orderBy('o.instNom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les données OpenData dans un rayon géographique
     */
    public function findWithinRadius(float $latitude, float $longitude, float $radiusKm): array
    {
        // Utilisation de la formule haversine pour calculer la distance
        $qb = $this->createQueryBuilder('o');
        
        return $qb
            ->addSelect(
                '(6371 * acos(cos(radians(:lat)) * cos(radians(o.equipY)) * cos(radians(o.equipX) - radians(:lng)) + sin(radians(:lat)) * sin(radians(o.equipY)))) AS HIDDEN distance'
            )
            ->andWhere('o.equipX IS NOT NULL')
            ->andWhere('o.equipY IS NOT NULL')
            ->having('distance <= :radius')
            ->setParameter('lat', $latitude)
            ->setParameter('lng', $longitude)
            ->setParameter('radius', $radiusKm)
            ->orderBy('distance', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Recherche textuelle dans les données OpenData
     */
    public function search(string $query): array
    {
        return $this->createQueryBuilder('o')
            ->andWhere('o.instNom LIKE :query OR o.equipNom LIKE :query OR o.instAdresse LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->orderBy('o.instNom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve toutes les activités disponibles dans l'OpenData
     */
    public function findAllActivities(): array
    {
        $result = $this->createQueryBuilder('o')
            ->select('DISTINCT o.equipApsNom')
            ->andWhere('o.equipApsNom IS NOT NULL')
            ->getQuery()
            ->getResult();

        $activities = [];
        foreach ($result as $row) {
            if ($row['equipApsNom']) {
                $activities = array_merge($activities, $row['equipApsNom']);
            }
        }

        return array_unique($activities);
    }

    /**
     * Récupère tous les inst_numero et inst_nom distincts depuis les données JSON
     * 
     * @return array Un tableau associatif avec inst_numero comme clé et inst_nom comme valeur
     */
    public function findDistinctInstitutions(): array
    {
        $sql = "
            SELECT DISTINCT 
                JSON_UNQUOTE(JSON_EXTRACT(data, '$.inst_numero')) as inst_numero,
                JSON_UNQUOTE(JSON_EXTRACT(data, '$.inst_nom')) as inst_nom
            FROM opendata 
            WHERE JSON_EXTRACT(data, '$.inst_numero') IS NOT NULL 
            AND JSON_EXTRACT(data, '$.inst_nom') IS NOT NULL
            ORDER BY inst_nom
        ";

        $connection = $this->getEntityManager()->getConnection();
        $result = $connection->executeQuery($sql)->fetchAllAssociative();

        // Reformate le résultat en tableau associatif
        $institutions = [];
        foreach ($result as $row) {
            $institutions[$row['inst_numero']] = $row['inst_nom'];
        }

        return $institutions;
    }

    /**
     * Trouve tous les équipements associés à une institution donnée
     */
    public function findEquipmentsByInstitution(string $instNumero): array
    {
        $sql = "
            SELECT * FROM opendata 
            WHERE JSON_UNQUOTE(JSON_EXTRACT(data, '$.inst_numero')) = :instNumero
        ";

        $connection = $this->getEntityManager()->getConnection();
        $result = $connection->executeQuery($sql, ['instNumero' => $instNumero])->fetchAllAssociative();

        // Convertir les résultats en entités OpenData
        $equipments = [];
        foreach ($result as $row) {
            $openData = new OpenData();
            $openData->setId($row['id']);
            $openData->setData(json_decode($row['data'], true));
            $openData->setLastUpdate(new \DateTimeImmutable($row['last_update']));
            $equipments[] = $openData;
        }

        return $equipments;
    }

    /**
     * Statistiques sur les données OpenData
     */
    public function getStatistics(): array
    {
        $totalCount = $this->count([]);
        
        $typeStats = $this->createQueryBuilder('o')
            ->select('o.equipTypeName, COUNT(o.equipNumero) as count')
            ->groupBy('o.equipTypeName')
            ->orderBy('count', 'DESC')
            ->getQuery()
            ->getResult();

        $cityStats = $this->createQueryBuilder('o')
            ->select('o.instComNom, COUNT(o.equipNumero) as count')
            ->groupBy('o.instComNom')
            ->orderBy('count', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        return [
            'total' => $totalCount,
            'by_equipment_type' => $typeStats,
            'by_city' => $cityStats
        ];
    }
}