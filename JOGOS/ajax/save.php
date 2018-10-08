<?php

$json = $_POST['data'];

//echo json_encode($json);

$fp = fopen($_SERVER["DOCUMENT_ROOT"] . '/JOGOS/' . 'database.json', 'w');
//echo $_SERVER['DOCUMENT_ROOT'] . '\database.json';

//$path = $_SERVER["DOCUMENT_ROOT"] . '/NOVO/' . 'database.json';

fwrite($fp, json_encode($json));
fclose($fp);

?> 