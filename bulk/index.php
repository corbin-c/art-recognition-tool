<?php
header("Content-type: application/json");
echo "{\"collection\":[";
if ($directory = opendir("./")) {
  $i=0;
  while (false !== ($file = readdir($directory))) {
    if ($file != "." && $file != ".." && $file != "index.php") {
      if ($i > 0) {
        echo ",";
      }
      echo "{";
      echo "\"file_path\":\"".$file."\",";
      echo "\"titre\":\"\",";
      echo "\"auteur\":\"\",";
      echo "\"description\":\"\",";
      echo "\"date\":\"\",";
      echo "\"details\":\"\"";
      echo "}";
      $i++;
    }
  }
closedir($directory);
}
echo "  ]}";
?>
