<?php


namespace API\Repository;


use API\Core\Database\Database;
use API\Core\Database\Model;
use PDO;

class ImageRepository extends Model
{
    private \PDO $conn;

public function __construct(\API\Core\Database\Database $db)
    {
        parent::__construct($db);
        $this->conn = $db->getConnection();
        $this->buildTable();
    }
    public function buildTable()
    {
        $sqlData = match (DB_TYPE) {
            'memory', 'sqlite' => file_get_contents(PATH_BUILD_TABLES . "upImages.sql"),
            'mysql' => file_get_contents(PATH_BUILD_TABLES . "upImages_mysql.sql"),
            default => null,
        };
        $conn = $this->db->getConnection();
        $conn->exec($sqlData);
        return;
    }

    public function registerNewImage(array $data): int
    {
        $query = "INSERT INTO UImages(
            storage,
            name,
            description,
            stars,
            type,
            width,
            height,
            size,
            keywords
        ) VALUES (
            :storage_,
            :name_,
            :desc_,
            :stars_,
            :type_,
            :width_,
            :height_,
            :size_,
            :keys_
        );";
        $stmt = $this->conn->prepare($query);
        try {
            $stmt->execute([
                'storage_' => $data['server_name'],
                'name_' =>  $data['name'],
                'desc_' =>  $data['desc'],
                'type_' =>  $data['type'],
                'width_' =>  $data['width'],
                'height_' =>  $data['height'],
                'size_' =>  $data['size'],
                'keys_' =>  $data['keys'],
                'stars_' =>  $data['stars'],
            ]);
        } catch (\PDOException $e) {
            throw new \RuntimeException('Failed to Register Image.', $e);
            die;
        }
        return (int)$this->conn->lastInsertId();
    }

    public function getAllImages(): array
    {
        $query = "select * from UImages;";
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll(\PDO::FETCH_OBJ);
    }
    public function getStorageImages(): array
    {
        $query = "select id, storage,name from UImages;";
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll(\PDO::FETCH_OBJ);
    }




    public function getAllCountries() : array
    {
        $query = "SELECT * FROM  WorldCountries LIMIT 30;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

}