<?php

$json = $_GET['data'];

$fp = fopen('../database.json', 'w');
fwrite($fp, json_encode($json));
fclose($fp);

?> 