<?php
/* Developed by Clément Corbin */
$path = pathinfo($_SERVER["SCRIPT_FILENAME"]);
if ($path["extension"] == "wasm") {
  header("Content-Type: application/wasm");
  readfile($_SERVER["SCRIPT_FILENAME"]);
}
else {
  return FALSE;
}
?>
