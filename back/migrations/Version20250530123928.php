<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250530123928 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE coach_favorite_institutions (coach_id INT NOT NULL, institution_id INT NOT NULL, INDEX IDX_822E4DC33C105691 (coach_id), INDEX IDX_822E4DC310405986 (institution_id), PRIMARY KEY(coach_id, institution_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE coach_favorite_institutions ADD CONSTRAINT FK_822E4DC33C105691 FOREIGN KEY (coach_id) REFERENCES coach (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE coach_favorite_institutions ADD CONSTRAINT FK_822E4DC310405986 FOREIGN KEY (institution_id) REFERENCES institution (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE place CHANGE data data JSON NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE coach_favorite_institutions DROP FOREIGN KEY FK_822E4DC33C105691');
        $this->addSql('ALTER TABLE coach_favorite_institutions DROP FOREIGN KEY FK_822E4DC310405986');
        $this->addSql('DROP TABLE coach_favorite_institutions');
        $this->addSql('ALTER TABLE place CHANGE data data LONGTEXT NOT NULL COLLATE `utf8mb4_bin`');
    }
}
