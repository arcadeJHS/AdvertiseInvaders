<?php

	require_once('Score.php');

	if(isset($_POST['action'])) {
		$data = array();
		$scorer = new Scorer(require 'config.php');

		// saveScore
		if($_POST['action'] == 'saveScore') {
			$name = $_POST['name'];
			$email = $_POST['email'];
			$score = $_POST['score'];

			$data = $scorer->saveScore($name, $email, $score);

			echo json_encode($data);
			die();
		}

		// getScore
		if($_POST['action'] == 'getScore') {
			$data = $scorer->getScore();

			echo json_encode($data);
			die();
		}
	}