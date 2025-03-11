<?php

namespace App\Repository;

use App\Entity\Institution;
use App\Entity\Place;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Place>
 */
class PlaceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Place::class);
    }

    /**
     * Récupère tous les inst_numero et inst_name distincts
     * 
     * @return array Un tableau associatif avec inst_numero comme clé et inst_name comme valeur
     */
    public function findDistinctInstitutions(): array
    {
        $result = $this->createQueryBuilder('p')
            ->select('p.inst_numero, p.inst_name')
            ->distinct(true)
            ->getQuery()
            ->getResult();

        // Reformate le résultat en tableau associatif
        $institutions = [];
        foreach ($result as $row) {
            $institutions[$row['inst_numero']] = $row['inst_name'];
        }

        return $institutions;
    }

    /**
     * Récupère les places qui ont une institution associée
     *
     * @return array Retourne un tableau de Places qui ont une institution associée
     */
    public function findAllWithInstitution(): array
    {
        return $this->createQueryBuilder('p')
            ->select('p.id, p.inst_numero, p.inst_name, p.data, p.lastUpdate')
            ->innerJoin(Institution::class, 'i', 'WITH', 'p.inst_numero = i.inst_numero')
            ->getQuery()
            ->getResult();
    }
}
