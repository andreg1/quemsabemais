<?php

$json = $_POST['data'];

//echo json_encode($json);

$fp = fopen('../database.json', 'w');
fwrite($fp, json_encode($json));
fclose($fp);

?> 