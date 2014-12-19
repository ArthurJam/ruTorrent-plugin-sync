<?php

require_once __DIR__ . '/HostManager.php';

$host_manager = HostManager::load();
$jResult .= sprintf('plugin.syncHostList = %s;', json_encode($host_manager->getAll()));

// On enregistre le plugin ?
$theSettings->registerPlugin($plugin['name'], $host_manager->getAll());