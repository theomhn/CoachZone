<?php

namespace App\Command;

use App\Service\SportFacilitySyncService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:sync-facilities',
    description: 'Synchronize sport facilities from external API',
)]
class SyncFacilitiesCommand extends Command
{
    public function __construct(
        private readonly SportFacilitySyncService $syncService
    )
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        try {
            $this->syncService->synchronizeFacilities();
            $output->writeln('Facilities synchronized successfully');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $output->writeln('Error: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}