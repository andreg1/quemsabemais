<?php
$json = $_POST['data'];

//echo json_encode($json);

$fp = fopen($_SERVER["DOCUMENT_ROOT"] . '/JOGOS/' . 'database.json', 'w');
//echo $_SERVER['DOCUMENT_ROOT'] . '\database.json';

//$path = $_SERVER["DOCUMENT_ROOT"] . '/NOVO/' . 'database.json';

$json = json_encode($json);

$pieces = str_split($json, 1024 * 4);
foreach ($pieces as $piece) {
    fwrite($fp, $piece, strlen($piece));
}

fclose($fp);

?> 
