<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250721102939 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE access_token (id INT AUTO_INCREMENT NOT NULL, token VARCHAR(255) NOT NULL, user_email VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE booking (id INT AUTO_INCREMENT NOT NULL, place_id VARCHAR(255) NOT NULL, coach_id INT DEFAULT NULL, date_start DATETIME NOT NULL, date_end DATETIME NOT NULL, price DOUBLE PRECISION NOT NULL, INDEX IDX_E00CEDDEDA6A219 (place_id), INDEX IDX_E00CEDDE3C105691 (coach_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE coach (id INT NOT NULL, last_name VARCHAR(255) NOT NULL, first_name VARCHAR(255) NOT NULL, work VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE coach_favorite_institutions (coach_id INT NOT NULL, institution_id INT NOT NULL, INDEX IDX_822E4DC33C105691 (coach_id), INDEX IDX_822E4DC310405986 (institution_id), PRIMARY KEY(coach_id, institution_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE institution (id INT NOT NULL, inst_numero VARCHAR(255) NOT NULL, inst_name VARCHAR(255) NOT NULL, adresse VARCHAR(500) DEFAULT NULL, ville VARCHAR(255) DEFAULT NULL, coordonnees JSON DEFAULT NULL, activites JSON DEFAULT NULL, equipements JSON DEFAULT NULL, UNIQUE INDEX UNIQ_3A9F98E5FF01948B (inst_numero), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE opendata (id VARCHAR(255) NOT NULL, data JSON NOT NULL, last_update DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE place (id VARCHAR(255) NOT NULL, institution_id INT DEFAULT NULL, inst_numero VARCHAR(255) NOT NULL, inst_name VARCHAR(255) NOT NULL, equip_nom VARCHAR(255) DEFAULT NULL, equip_aps_nom JSON DEFAULT NULL, equip_surf DOUBLE PRECISION DEFAULT NULL, price DOUBLE PRECISION DEFAULT NULL, last_update DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_741D53CD10405986 (institution_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, type VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_E00CEDDEDA6A219 FOREIGN KEY (place_id) REFERENCES place (id)');
        $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_E00CEDDE3C105691 FOREIGN KEY (coach_id) REFERENCES coach (id)');
        $this->addSql('ALTER TABLE coach ADD CONSTRAINT FK_3F596DCCBF396750 FOREIGN KEY (id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE coach_favorite_institutions ADD CONSTRAINT FK_822E4DC33C105691 FOREIGN KEY (coach_id) REFERENCES coach (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE coach_favorite_institutions ADD CONSTRAINT FK_822E4DC310405986 FOREIGN KEY (institution_id) REFERENCES institution (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE institution ADD CONSTRAINT FK_3A9F98E5BF396750 FOREIGN KEY (id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE place ADD CONSTRAINT FK_741D53CD10405986 FOREIGN KEY (institution_id) REFERENCES institution (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_E00CEDDEDA6A219');
        $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_E00CEDDE3C105691');
        $this->addSql('ALTER TABLE coach DROP FOREIGN KEY FK_3F596DCCBF396750');
        $this->addSql('ALTER TABLE coach_favorite_institutions DROP FOREIGN KEY FK_822E4DC33C105691');
        $this->addSql('ALTER TABLE coach_favorite_institutions DROP FOREIGN KEY FK_822E4DC310405986');
        $this->addSql('ALTER TABLE institution DROP FOREIGN KEY FK_3A9F98E5BF396750');
        $this->addSql('ALTER TABLE place DROP FOREIGN KEY FK_741D53CD10405986');
        $this->addSql('DROP TABLE access_token');
        $this->addSql('DROP TABLE booking');
        $this->addSql('DROP TABLE coach');
        $this->addSql('DROP TABLE coach_favorite_institutions');
        $this->addSql('DROP TABLE institution');
        $this->addSql('DROP TABLE opendata');
        $this->addSql('DROP TABLE place');
        $this->addSql('DROP TABLE user');
    }
}
