<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data)) {
    $response = [
        "status" => "success",
        "message" => "Data received",
        "data" => $data
    ];
    http_response_code(200); 
} else {
    error_log("Error: No data received or JSON decoding failed. Received data: " . file_get_contents("php://input"));
    $response = [
        "status" => "error",
        "message" => "No data received"
    ];
    http_response_code(400); 
}

echo json_encode($response);
?>
