<?php
/**
 * SPYCO GROUP PORTAL — mailer.php
 * SMTP email proxy for jimmy@spyco.com.au
 * Upload this file alongside index.html on portal.spyco.com.au
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// ── SMTP Configuration ────────────────────────────────────────
define('SMTP_HOST',     'mail.spyco.com.au');
define('SMTP_PORT',     465);
define('SMTP_SECURE',   'ssl');
define('SMTP_USER',     'jimmy@spyco.com.au');
define('SMTP_PASS',     'Aust@2022#6');
define('SMTP_FROM',     'jimmy@spyco.com.au');
define('SMTP_FROM_NAME','Jimmy Spyropoulos — Spyco Group');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get and sanitise inputs
$to      = filter_var(trim($_POST['to'] ?? ''), FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars(trim($_POST['subject'] ?? ''), ENT_QUOTES, 'UTF-8');
$body    = trim($_POST['body'] ?? '');
$cc      = filter_var(trim($_POST['cc'] ?? ''), FILTER_SANITIZE_EMAIL);
$bcc     = filter_var(trim($_POST['bcc'] ?? ''), FILTER_SANITIZE_EMAIL);

// Validate
if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid recipient email address']);
    exit;
}
if (empty($subject)) {
    echo json_encode(['success' => false, 'message' => 'Subject is required']);
    exit;
}
if (empty($body)) {
    echo json_encode(['success' => false, 'message' => 'Message body is required']);
    exit;
}

// ── Try PHPMailer first (if available) ───────────────────────
$phpmailerPath = __DIR__ . '/phpmailer/src/PHPMailer.php';
if (file_exists($phpmailerPath)) {
    require $phpmailerPath;
    require __DIR__ . '/phpmailer/src/SMTP.php';
    require __DIR__ . '/phpmailer/src/Exception.php';

    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = SMTP_PORT;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);
        $mail->addReplyTo(SMTP_FROM, SMTP_FROM_NAME);
        $mail->addAddress($to);
        if ($cc)  $mail->addCC($cc);
        if ($bcc) $mail->addBCC($bcc);

        $mail->isHTML(false);
        $mail->Subject = $subject;
        $mail->Body    = $body . "\n\n--\nSent via Spyco Group Portal\nportal.spyco.com.au";

        $mail->send();
        echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
        exit;
    } catch (Exception $e) {
        // Fall through to PHP mail()
    }
}

// ── Fallback: PHP mail() function ────────────────────────────
$headers  = "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM . ">\r\n";
$headers .= "Reply-To: " . SMTP_FROM . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
if ($cc)  $headers .= "Cc: $cc\r\n";
if ($bcc) $headers .= "Bcc: $bcc\r\n";

$fullBody = $body . "\n\n--\nSent via Spyco Group Portal\nportal.spyco.com.au";

$sent = @mail($to, $subject, $fullBody, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Email sent via server mail']);
} else {
    echo json_encode(['success' => false, 'message' => 'Server mail failed. Please use the Gmail option.']);
}
?>