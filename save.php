<?php

$json = $_POST['data'];

$fp = fopen('database.json', 'w');
fwrite($fp, $json);
fclose($fp);


?> 