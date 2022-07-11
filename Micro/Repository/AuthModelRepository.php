<?php
/**
 * Created by PhpStorm.
 * User: Mike
 * Date: 18/02/2019
 * Time: 17:47
 */

namespace API\Repository;

use API\Interfaces\RepositoryInterface;
use API\Core\Database\Database;
use API\Core\Database\Model;
use API\Core\Session\Session;
use API\Core\Utils\AppCrypt;
use API\Core\Utils\Logger;
use API\Models\AppUser;
use API\Controllers\AuthorController;

class AuthModelRepository extends Model implements RepositoryInterface
{
    protected \PDO $conn;
    public function __construct(Database $db)
    {
        parent::__construct($db);

        $this->conn=$db->getConnection();
        AuthModelRepository::BuildTable();
        $query = "SELECT * FROM Users;";
        $stmt = $this->conn->query($query);
        if (!$stmt->fetchAll(\PDO::FETCH_ASSOC)) {
            AuthModelRepository::seed();
        }
    }
    public function buildTable()
    {
        $sqlData = match (DB_TYPE) {
            'memory', 'sqlite' => file_get_contents(PATH_BUILD_TABLES . "table_users_sqlite.sql"),
            'mysql' => file_get_contents(PATH_BUILD_TABLES . "table_users_mysql.sql"),
            default => null,
        };
        $conn = $this->db->getConnection();
        $conn->exec($sqlData);
    }
    private function seed()
    {
        $newUserID = $this->registerNewUser((new AppUser())
            ->setName('John Doe')
            ->setEmail('john@mail.com')
            ->setCreated(strtotime(date("Y-m-d H:i:s")))
            ->setLastLogged(strtotime(date("Y-m-d H:i:s")))
            ->setEdited(strtotime(date("Y-m-d H:i:s")))
            ->setPass(AppCrypt::hashFactory('John0000'))
            ->setAvatar('default_avatar.png')
            ->setLanguageActive('pt')
            ->setIdentifier(AppCrypt::generateIdentifier('John Doe'))
            ->setIdPass(AppCrypt::getInstance()->crypt('John0000')));
        AuthorController::setDefaultPubAvatar($newUserID);
    }
    public function registerNewUser(AppUser $user) : int
    {
        $query = "INSERT INTO Users (
                    created,
                    lastLogged,
                    edited,
                    email,
                    name, 
                    pass, 
                    avatar, 
                    language_active,
                    identifier,
                    id_pass
                    ) VALUES(
                    :created, 
                    :lastLogged, 
                    :edited, 
                    :mail, 
                    :name, 
                    :pass , 
                    :avatar, 
                    :language_active,
                    :identifier,
                    :id_pass
                );";
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare($query);

        try {
            $stmt->execute([
                'created'  => $user->getCreated(),
                'lastLogged'  => $user->getLastLogged(),
                'edited'  => $user->getEdited(),
                'mail' => $user->getEmail(),
                'name'  => $user->getName(),
                'language_active'  => $user->getLanguageActive(),
                'pass' => $user->getPass(),
                'avatar' => $user->getPrivateAvatar(),
                'identifier' => $user->getIdentifier(),
                'id_pass' => $user->getIdPass()
            ]);
        } catch (\PDOException $e) {
//            die("Failed to Insert New USER");
            return false;
        }
        return (int)$conn->lastInsertId();
    }
    public function validate(AppUser $user) : int
    {
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare('SELECT * FROM Users WHERE email = :email AND pass = :pass;');
        $stmt->execute([
            'email' =>  $user->getEmail(),
            'pass' =>  $user->getPass(),
        ]);
        /**@var $userData AppUser */
        $userData = $stmt->fetchObject("\\API\\Models\\AppUser");
        if ($userData) {
            Session::authorize($userData);
            Logger::log('User Authenticated');
            Logger::log("user preferred Language " . $userData->getLanguageActive());
            Logger::log("session Active Language " . Session::get('ACTIVE_LANG'));
            return $userData->getId();
        }
        Logger::log('User NOT Authenticated');
        return 0;
    }
    public function getUserByID(int $user)
    {
        $conn = $this->db->getConnection();
        $query = "SELECT * FROM Users WHERE Users.id = :id";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'id' => $user
        ]);
        return $stmt->fetchObject("\\API\\Models\\AppUser");
    }
    public function updateUserToken(AppUser $user)
    {
        $conn = $this->db->getConnection();
        $query = "UPDATE Users SET token = :token, timeout = :timeout WHERE id = :id;";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'id' => $user->getId(),
            'token'  => $user->getToken(),
            'timeout'  => $user->getTimeout()
        ]);

        $query = "SELECT Users.id, Users.name, Users.email, Users.identifier, Users.token FROM Users WHERE Users.id = :id";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'id' => $user->getId(),
        ]);
//        return $stmt->fetchObject("\\API\\Models\\AppUser");
        return $stmt->fetchObject(AppUser::class);
    }
    public function validateAuthCookie(AppUser $user)
    {
        $conn = $this->db->getConnection();
        $query = "SELECT * FROM Users where Users.identifier = :identifier and Users.token = :token";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'identifier' => $user->getIdentifier(),
            'token' => $user->getToken(),
        ]);
//        if ($user = $stmt->fetchObject("\\API\\Models\\AppUser")) {
        if ($user = $stmt->fetchObject(AppUser::class)) {
            return $user;
        } else {
            return false;
        }
    }
    public function checkIfUniqueEmail(AppUser $user)
    {
        $conn = $this->db->getConnection();
        $query = "SELECT id FROM Users WHERE Users.email = :email";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'email' => $user->getEmail()
        ]);
        if ($stmt->fetch()) {
            return "EMAIL_IN_USE";
        } else {
            return null;
        }
    }
    public function checkIfRegisteredUser(AppUser $user)
    {
        $conn = $this->db->getConnection();
        $query = "SELECT id FROM Users WHERE Users.email = :email";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'email' => $user->getEmail()
        ]);
        if ($stmt->fetch()) {
            return null;
        } else {
            return "EMAIL_NOT_REGISTERED";
        }
    }
    public function checkIfUniqueUserName(AppUser $user)
    {
        $conn = $this->db->getConnection();
        $query = "SELECT id FROM Users WHERE Users.name = :name";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'name' => $user->getName()
        ]);
        if ($stmt->fetch()) {
            return "USER_NAME_REGISTERED";
        } else {
            return null;
        }
    }
    public function setUserRecoveryToken(AppUser $user)
    {
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare('UPDATE Users SET rp_token = :token, secret = :secret WHERE email=:email');
        $stmt->execute([
            'token' => $user->getRpToken(),
            'secret' => $user->getSecret(),
            'email' => $user->getEmail()
        ]);
        # Check if successful
        $query = "SELECT * FROM Users WHERE Users.email = :email";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'email' => $user->getEmail(),
        ]);
//        return $stmt->fetchObject("\\API\\Models\\AppUser");
        return $stmt->fetchObject(AppUser::class);
    }
    public function validateRecoverSecret(AppUser $user)
    {
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare('SELECT * FROM Users WHERE Users.rp_token = :token;');
        $stmt->execute([
            'token' =>  $user->getRpToken()
        ]);
        /**@var $targetUser AppUser */
        $targetUser = $stmt->fetchObject(AppUser::class);
        if ($targetUser->getSecret() == $user->getSecret()) {
            return true;
        } else {
            return false;
        }
    }
    public function checkRecoveryToken(AppUser $user)
    {
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare('SELECT * FROM Users WHERE rp_token= :token;');
        $stmt->execute([
            'token' =>  $user->getRpToken()
        ]);
        return $stmt->fetchObject(AppUser::class);
    }
    public function updateUserPass(AppUser $user)
    {
        $query = "UPDATE Users SET pass = :pass, secret = :cleanSecret, rp_token = :cleanToken, edited = :edited WHERE rp_token = :token;";
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'token'  => $user->getRpToken(),
            'pass'  => $user->getPass(),
            'edited' => $user->getEdited(),
            'cleanToken'  => '',
            'cleanSecret'  => ''
        ]);
        return true;
    }
    public function resetReplyToken(AppUser $user)
    {
        $query = "UPDATE Users SET secret = :secret, rp_token = :cleanToken WHERE rp_token = :token;";
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'token'  => $user->getRpToken(),
            'cleanToken'  => '',
            'secret'  => ''
        ]);
        return true;
    }
    public function updateAvatarDBFile($id, $file_avatar)
    {
        $now = date("Y-m-d H:i:s");
        $query = "UPDATE Users SET avatar = :file_avatar, edited = :date_updated  WHERE id = :id;";
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare($query);
        $stmt->execute([
            'id' => $id,
            'file_avatar'  => $file_avatar,
            'date_updated'  => time()
        ]);
        if (!$stmt) {
            print_r($conn->errorInfo());
            die("FAILED TO UPDATE AVATAR FILE<br/>Check DB Config! [ App/Config/appConfig.php ]");
        };
        return $now;
    }
    public function updateLastLogged(int $id)
    {
        $query = "UPDATE Users SET lastLogged = :time WHERE id = :id ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([
           'id' =>  $id,
           'time' =>  strtotime(date("Y-m-d H:i:s")),
        ]);
    }



    public function getAll()
    {
        $conn = $this->db->getConnection();
        $query = "SELECT * FROM Users";
        $stmt = $conn->prepare($query);
        $stmt->execute([
        ]);
        return $stmt->fetchAll(\PDO::FETCH_CLASS,AppUser::class);
    }
    
    public function getByID($id)
    {
        // TODO: Implement getByID() method.
    }
    public function update($data)
    {
        // TODO: Implement update() method.
    }
    public function deleteByID($id)
    {
        // TODO: Implement deleteByID() method.
    }
    public function registerNew($data)
    {
        // TODO: Implement registerNew() method.
    }
}
