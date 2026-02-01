@echo off

rem User's Android Studio location is F:\bill\Android Studio
set KEYTOOL_PATH="F:\bill\Android Studio\jbr\bin\keytool.exe"

echo Step 0: Ensuring directory 'F:\bill\android' exists...
mkdir "F:\bill\android"

set JKS_PATH="F:\bill\android\new_billgst_keystore.jks"
set PEM_PATH="F:\bill\android\upload_certificate.pem"
set NEW_ALIAS="billgst_new"
set NEW_PASSWORD="BillGST@2024"
set DNAME="CN=BillGST, OU=IT, O=BillGST, L=Jaipur, ST=Rajasthan, C=IN"

echo =================================================================
echo  Kripya dhyaan dein: Yeh script aapke liye sab kuch automatically karegi.
echo =================================================================
echo.
pause

echo Step 1: Nayi keystore file (JKS) bana rahe hain...
%KEYTOOL_PATH% -genkeypair -alias %NEW_ALIAS% -keyalg RSA -keysize 2048 -validity 10000 -keystore %JKS_PATH% -storepass %NEW_PASSWORD% -keypass %NEW_PASSWORD% -dname %DNAME% -v

if %errorlevel% neq 0 (
    echo.
    echo !!!!!!!!!! ERROR !!!!!!!!!!
    echo Keystore file nahin ban paayi. Please is poori window ka screenshot lein.
    pause
    exit /b
)

echo.
echo Step 1 Safaltapoorvak poora hua!
echo.
echo Step 2: PEM certificate file bana rahe hain...
%KEYTOOL_PATH% -export -rfc -alias %NEW_ALIAS% -file %PEM_PATH% -keystore %JKS_PATH% -storepass %NEW_PASSWORD% -v

if %errorlevel% neq 0 (
    echo.
    echo !!!!!!!!!! ERROR !!!!!!!!!!
    echo PEM file nahin ban paayi. Please is poori window ka screenshot lein.
    pause
    exit /b
)

echo.
echo =================================================================
echo  ***** BAHUT ZAROORI *****
echo.
echo  SAB KUCH SAFALTAPOORVAK HO GAYA HAI!
echo.
echo  Aapke F:\bill\android\ folder mein do nayi files ban gayi hain:
echo  1. new_billgst_keystore.jks
echo  2. upload_certificate.pem
echo.
echo  Aapki nayi keystore ka password hai: BillGST@2024
echo.
echo  Kripya is password ko surakshit rakhein.
echo.
echo  Ab aap Google Play Support ko F:\bill\android\upload_certificate.pem file bhej sakte hain.
echo =================================================================
echo.
pause
