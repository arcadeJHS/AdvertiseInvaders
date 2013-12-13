<?php

	class Scorer {

		private $config;
		private $DB = null;

		public function __construct(array $config) {
			$this->config = $config;
		}

		private function openDB() {
			$host = $this->config['host'];
			$dbname = $this->config['dbname'];
			$user = $this->config['dbuser'];
			$password = $this->config['dbpassword'];

			$this->DB = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
		}

		private function closeDB() {
			$this->DB = null;
		}

		private function checkData($name) {
			$data = array(
				'go' 	=> true,
				'text'	=> ''
			);

			if (strlen($name) < 1) {
				$data = array(
					'go' 	=> false,
					'text'	=> 'Please insert your name'
				);
			}

			// Profanity filter
			$profTest = strtoupper($name);
			$profTest = preg_replace("/( |-)/", '', $profTest);
			$profanity = "/(FUCK|SHIT|ASS|BITCH|CUM|DICK|WHORE|COCK|DILDO|PISS|PENIS|VAGINA|BLOWJ|SUCK)/";
			if(preg_match($profanity, $profTest)) {
				$data = array(
					'go' 	=> false,
					'text'	=> 'Please do not use profanity in your name'
				);
			}

			return $data;
		}

		public function saveScore($name, $email, $score) {
			$data = array();


			$check = $this->checkData($name);
			if (!$check['go']) {
				$data = array(
					'text' 	=> $check['text']
				);
				return $data;
			}


			try {
				$this->openDB();
				$params = array( 'name' => $name, 'email' => $email, 'score' => $score );
				$sql ="REPLACE INTO si_score (id, name, score, email) VALUES(1, :name, :score, :email);";				 
				$q = $this->DB->prepare($sql);
				$q->execute($params);
				$rows = $q->rowCount();
				$this->closeDB();

				$data = array(
					'text' 	=> 'Score saved'
				);
			}
			catch(PDOException $e) {
				$data = array(
					'text' 	=> $e->getMessage()
				);
				return $data;
			}	

			return $data;		
		}

		public function getScore() {
			$data = array();

			try {
				$this->openDB();
				$sql = "SELECT name, email, score FROM si_score WHERE score=(SELECT MAX(score) FROM si_score);";
				$q = $this->DB->prepare($sql);
				$q->execute();
				$q->setFetchMode(PDO::FETCH_ASSOC);
				$rows = $q->fetchAll();
				$this->closeDB();

				$data = array(
					'text'	=> "Best score retrieved",
					'data'	=> $rows
				);				
			}
			catch(PDOException $e) {
				$data = array(
					'text' 	=> $e->getMessage()
				);
				return $data;
			}

			return $data;
		}

	}





