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
     * Trouve les places par numéro d'institution
     */
    public function findByInstitutionNumero(string $instNumero): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.inst_numero = :instNumero')
            ->setParameter('instNumero', $instNumero)
            ->orderBy('p.id', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Récupère les places qui ont une institution associée
     * Si un numéro d'institution est fourni, filtre les résultats pour cette institution
     *
     * @param string|null $instNumero Le numéro d'institution (facultatif)
     * @return array Retourne un tableau d'entités Place qui ont une institution associée
     */
    public function findPlacesWithInstitution(?string $instNumero = null): array
    {
        $qb = $this->createQueryBuilder('p')
            ->innerJoin(Institution::class, 'i', 'WITH', 'p.inst_numero = i.inst_numero');

        if ($instNumero !== null) {
            $qb->andWhere('p.inst_numero = :instNumero')
                ->setParameter('instNumero', $instNumero);
        }

        return $qb->getQuery()->getResult();
    }
}
