<?php

require realpath(__DIR__ . '/../../php/xmlrpc.php');

if (3 === $argc) {
    $file_hash   = $argv[1];
    $file_number = intval($argv[2]);

    $request = new rXMLRPCRequest(array(
        new rXMLRPCCommand('f.get_size_chunks', array($file_hash, $file_number)),
        new rXMLRPCCommand('f.get_completed_chunks', array($file_hash, $file_number))
    ));

    if ($request->success()) {
        $chunk_count     = intval($request->val[0]);
        $chunk_completed = intval($request->val[1]);

        if ($chunk_completed == $chunk_count) {
            exit(0);
        }
    }
}

exit(1);