<?php

namespace App\Command;

use App\Service\PlaceSyncService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:sync-places',
    description: 'Synchronize places from external API',
)]
class SyncPlacesCommand extends Command
{
    public function __construct(
        private readonly PlaceSyncService $syncService
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        try {
            $this->syncService->synchronizePlaces();
            $output->writeln('Places synchronized successfully');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $output->writeln('Error: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
