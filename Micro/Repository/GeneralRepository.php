<?php


namespace API\Repository;


use API\Core\Database\Database;
use API\Core\Database\Model;
use API\Models\Quotes;
use PDO;

class GeneralRepository extends Model
{

    private \PDO $conn;

    public function __construct(\API\Core\Database\Database $db)
    {
        parent::__construct($db);
        $this->db = $db;
        $this->conn=$db->getConnection();
        GeneralRepository::buildQuotesTable();
        $query = "SELECT * FROM Quotes;";
        $stmt = $this->conn->query($query);
        if (!$stmt->fetchAll(\PDO::FETCH_ASSOC)) {
            GeneralRepository::seed();
        }

    }


    public function CallProcedure($procedureName, $parameters = null, $isExecute = false)  {
        $syntax = '';
        for ($i = 0; $i < count($parameters); $i++) {
            $syntax .= (!empty($syntax) ? ',' : '') . '?';
        }
        $syntax = 'CALL ' . $procedureName . '(' . $syntax . ');';
//        $pdo = $this->db->getConnection();

        $this->conn->setAttribute(\PDO::ATTR_EMULATE_PREPARES, true);
        $stmt = $this->conn->prepare($syntax,[\PDO::ATTR_CURSOR=>\PDO::CURSOR_SCROLL]);
        for ($i = 0; $i < count($parameters); $i++) {
            $stmt->bindValue((1 + $i), $parameters[$i]);
        }
        $exec = $stmt->execute();
        if (!$exec) return $this->conn->errorInfo();
        if ($isExecute) return $exec;
        $results = [];
        do {
            try {
                $results[] = $stmt->fetchAll(\PDO::FETCH_OBJ);
            } catch (\Exception $ex) {

            }
        } while ($stmt->nextRowset());
        if (1 === count($results)) return $results[0];
        return $results;
    }

    private function seed()
    {
        // Add Content to the Database
        $sqlData = file_get_contents(PATH_BUILD_TABLES . "quotes.sql");
        $conn = $this->db->getConnection();
        $conn->exec($sqlData);
    }
    public function getQuote(): Quotes
    {
        if(DB_TYPE === 'sqlite' || DB_TYPE === 'memory'){
            $query  = 'SELECT * FROM Quotes WHERE id='.rand(1,102).';';

        }else{
            $query  = 'SELECT * FROM Quotes ORDER BY RAND() LIMIT 1;';

        }
        $stmt = $this->conn->prepare($query);
        $stmt->execute([]);
        return $stmt->fetchObject(Quotes::class);
    }
    private function buildQuotesTable() {
        // Builds table on first start
        $sqlData = match (DB_TYPE) {
            'memory', 'sqlite' => file_get_contents(PATH_BUILD_TABLES . "create_quotes_sqlite.sql"),
            'mysql' => file_get_contents(PATH_BUILD_TABLES . "create_quotes_mysql.sql"),
            default => null,
        };
        $this->conn->exec($sqlData);
    }
    private function buildCountriesTable() {
        // Builds table on first start
        $sqlData = match (DB_TYPE) {
            'memory', 'sqlite' => file_get_contents(PATH_BUILD_TABLES . "Countries.sql"),
            'mysql' => file_get_contents(PATH_BUILD_TABLES . "Countries.sql"),
            default => null,
        };
        $this->conn->exec($sqlData);
    }
    public function getMonthData(int $month, int $year) : array
    {
        $query = "select distinct cast(date as date ) as busyDate, DAY(date) as day, class, email from CalendarEvents where MONTH(date) = :month and YEAR(date) = :year;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([
            'month' => $month,
            'year' => $year,
        ]);
        return $stmt->fetchAll();
    }

    public function getAllUsers() : array
    {
        $query = "SELECT * FROM  Autocomplete LIMIT 30;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUsersByNeedle(string $needle): array
    {
        $query = "SELECT * FROM  Autocomplete where name like '%".$needle."%' collate utf8_general_ci;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function getAllCountries() : array
    {
        $query = "SELECT * FROM  WorldCountries LIMIT 30;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
//    public function getCountriesByName($country): array
//    {
//        $query = "SELECT * FROM  Countries where name=:name;";
//        $stmt = $this->conn->prepare($query);
//        $stmt->execute([
//            'name' => $country
//        ]);
//        return $stmt->fetchAll(PDO::FETCH_ASSOC);
//    }
    public function getCountriesByNeedle(string $needle): array
    {
        $query = "SELECT * FROM  WorldCountries where name like '%".$needle."%' collate utf8_general_ci;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
//
    public function getAllQuotes(): array
    {
        $query = "select * from Quotes;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([]);

        return $stmt->fetchAll(\PDO::FETCH_CLASS,Quotes::class);
    }


    public function addNewCountry(array $country): int
    {
        $query = "INSERT INTO WorldCountries (
                    name,
                    name_official,
                    code,
                    capital,
                    government,
                    currency,
                    religion,
                    population,
                    domain,
                    continent,
                    region,
                    flag      
                    ) values (
                    :name,
                    :name_official,
                    :code,
                    :capital,
                    :government,
                    :currency,
                    :religion,
                    :population,
                    :domain,
                    :continent,
                    :region,
                    :flag      
        );";
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare($query);
        try {
            $stmt->execute([
                'name'  => $country['name'],
                'name_official'  => $country['name_official'],
                'code'  => $country['code'],
                'capital' => $country['capital'],
                'government'  => $country['government'],
                'currency'  => $country['currency'],
                'religion' => $country['religion'],
                'population' => $country['population'],
                'domain' => $country['domain'],
                'continent' => $country['continent'],
                'region' => $country['region'],
                'flag' => $country['flag'],
            ]);
        } catch (\PDOException $e) {
            dump($e);
            die;
//            return false;
        }
        return (int)$conn->lastInsertId();

    }


//    public function getMonthData(int $month, int $year) : array
//    {
////        $query = "select distinct cast(date as date ) as busyDay, id, class, email from CalendarEvents where MONTH(date) = :month and YEAR(date) = :year;";
//        $query = "select distinct cast(date as date ) as busyDate, DAY(date) as day, class, email from CalendarEvents where MONTH(date) = :month and YEAR(date) = :year;";
//        $stmt = $this->conn->prepare($query);
//        $stmt->execute([
//            'month' => $month,
//            'year' => $year,
//        ]);
//        return $stmt->fetchAll();
//    }
















}