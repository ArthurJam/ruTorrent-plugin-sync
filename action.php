<?php

$return = null;

require_once dirname(__FILE__) . '/../_task/task.php';
require_once dirname(__FILE__) . '/HostManager.php';

switch ($_POST['cmd']) {
    case 'addTask':
        try {
            $host_manager = HostManager::load();
            $rtorrent_settings = rTorrentSettings::get();

            $torrent_hash_list = filter_var($_POST['torrent_hash'], FILTER_SANITIZE_STRING, FILTER_REQUIRE_ARRAY);
            $file_id_list = filter_var($_POST['file_id'], FILTER_SANITIZE_STRING, FILTER_REQUIRE_ARRAY);
            $host_id = filter_var($_POST['host_id'], FILTER_SANITIZE_STRING);

            // Contrôles rapides des variables
            if (isset($torrent_hash_list[0]) && $host_manager->get($host_id) !== null) {
                // Les fichiers sont ils filtrés ?
                $filter_file = $file_id_list && isset($file_id_list[0]);

                foreach ($torrent_hash_list as $torrent_hash) {
                    if ($filter_file) {
                        $file_selected = $directory_selected = array();

                        foreach ($file_id_list as $file_id) {
                            if (1 == preg_match('#^_f_(?<file_id>\d+)$#', $file_id, $matches)) {
                                $file_selected[] = $matches['file_id'];
                            } elseif (1 == preg_match('#^_d_(?<directory_name>.+)$#', $file_id, $matches)) {
                                $directory_selected[] = $matches['directory_name'];
                            }
                        }
                    }

                    $request_torrent = new rXMLRPCRequest(
                        new rXMLRPCCommand('d.get_name', array($torrent_hash))
                    );

                    $request_file = new rXMLRPCRequest(
                        new rXMLRPCCommand('f.multicall', array(
                            $torrent_hash,
                            '',
                            $rtorrent_settings->getCommand('f.get_frozen_path='),
                            $rtorrent_settings->getCommand('f.get_path='),
                            $rtorrent_settings->getCommand('f.get_size_chunks='),
                            $rtorrent_settings->getCommand('f.get_completed_chunks='),
                        ))
                    );

                    if ($request_torrent->success() && $request_file->success()) {
                        $i = $c = 0;

                        $torrent_name = $request_torrent->val[0];

                        foreach (array_chunk($request_file->val, 4, false) as $file) {
                            list ($filename_absolute, $filename, $chunk, $chunk_completed) = $file;

                            if ($filter_file) {
                                foreach ($directory_selected as $directory) {
                                    if (1 == preg_match(sprintf('#^%s/#', preg_quote($directory)), $filename)) {
                                        $file_selected[] = $i;
                                    }
                                }
                            }

                            if (!$filter_file || in_array($i, $file_selected)) {
                                $command_php_complete = sprintf('%s %s %s %d', escapeshellcmd(getExternal('php')), escapeshellarg(realpath(__DIR__ . DIRECTORY_SEPARATOR . 'complete.php')), escapeshellcmd($torrent_hash), $i);
                                $command_php_push = sprintf('%s %s %s --ftp-create-dirs --globoff --continue - --upload-file %s', escapeshellcmd(getExternal('curl')), escapeshellarg($host_manager->getCurlUrl($host_id, $filename)), $host_manager->getCurlOptions($host_id), escapeshellarg($filename_absolute));
                                $command_bash = "while ! $command_php_complete ; do sleep 30 ; done\n$command_php_push";

                                $task = new rTask(array(
                                    'arg' => call_user_func('end', explode('/', $filename)),
                                    'requester' => 'sync',
                                    'name' => 'push'
                                ));

                                $task->start(array($command_bash));

                                ++$c;
                            }

                            ++ $i;
                        }

                        cachedEcho('noty(theUILang.sync.task.add.success.replace("%count%", ' . $c . ').replace("%torrent%", "' . addcslashes($torrent_name, '"') . '"), "success");', null, false, false);
                    }
                }

                exit();
            }
        } catch (\Exception $e) {}

        cachedEcho('noty(theUILang.sync.task.add.error, "error");');

        break;

    case 'option':
        $host_manager = HostManager::load();

        switch (filter_input(INPUT_POST, 'action', FILTER_SANITIZE_STRING)) {
            case 'new':
                $host_config = array(
                    'name' => filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING),
                    'protocol' => filter_input(INPUT_POST, 'protocol', FILTER_SANITIZE_STRING),
                    'host' => filter_input(INPUT_POST, 'host', FILTER_SANITIZE_STRING),
                    'port' => filter_input(INPUT_POST, 'port', FILTER_SANITIZE_NUMBER_INT),
                    'path' => filter_input(INPUT_POST, 'path', FILTER_SANITIZE_STRING),
                    'secure' => filter_input(INPUT_POST, 'secure', FILTER_SANITIZE_STRING),
                    'username' => filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING),
                    'password' => filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING),
                    'certificate_private' => filter_input(INPUT_POST, 'certificate_private', FILTER_SANITIZE_STRING),
                    'certificate_public' => filter_input(INPUT_POST, 'certificate_public', FILTER_SANITIZE_STRING),
                    'certificate_passphrase' => filter_input(INPUT_POST, 'certificate_passphrase', FILTER_SANITIZE_STRING)
                );

                $host_manager->add($host_config);
                break;

            case 'edit':
                $host_config = array(
                    'id' => $id = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_STRING),
                    'name' => filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING),
                    'protocol' => filter_input(INPUT_POST, 'protocol', FILTER_SANITIZE_STRING),
                    'host' => filter_input(INPUT_POST, 'host', FILTER_SANITIZE_STRING),
                    'port' => filter_input(INPUT_POST, 'port', FILTER_SANITIZE_NUMBER_INT),
                    'path' => filter_input(INPUT_POST, 'path', FILTER_SANITIZE_STRING),
                    'secure' => filter_input(INPUT_POST, 'secure', FILTER_SANITIZE_STRING),
                    'username' => filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING),
                    'password' => filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING),
                    'certificate_private' => filter_input(INPUT_POST, 'certificate_private', FILTER_SANITIZE_STRING),
                    'certificate_public' => filter_input(INPUT_POST, 'certificate_public', FILTER_SANITIZE_STRING),
                    'certificate_passphrase' => filter_input(INPUT_POST, 'certificate_passphrase', FILTER_SANITIZE_STRING)
                );

                $host_manager->update($id, $host_config);
                break;

            case 'delete':
                $host_manager->delete(filter_input(INPUT_POST, 'id', FILTER_SANITIZE_STRING));
                break;
        }

        cachedEcho(
            json_encode($host_manager->getAll()),
            'application/json'
        );
        break;
}
