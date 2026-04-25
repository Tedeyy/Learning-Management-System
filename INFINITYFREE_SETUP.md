# InfinityFree Deployment Guide

Follow these steps to host your LMS on InfinityFree.

## 1. Prepare Your Database
1. Log in to your **InfinityFree Client Area**.
2. Go to **MySQL Databases**.
3. Create a new database (e.g., `eduready`).
4. Note down the following details:
   - **MySQL Hostname** (usually `sqlXXX.infinityfree.com`)
   - **MySQL Database Name** (starts with `if0_...`)
   - **MySQL Username** (starts with `if0_...`)
   - **MySQL Password** (your account password)
5. Open **phpMyAdmin** from your dashboard.
6. Select your new database and click **Import**.
7. Upload the `eduready_db.sql` file from your project root.

## 2. Upload Files
1. Use an FTP client (like FileZilla) or the **Online File Manager**.
2. Navigate to the `htdocs` folder.
3. Upload all files from your project into `htdocs`.
   - **IMPORTANT**: The `index.html` file must be directly inside `htdocs`.

## 3. Configure Credentials
You have two options for setting up your database connection:

### Option A: Using .env (Recommended)
1. Open the `.env` file you uploaded.
2. Update the values with your InfinityFree details:
   ```env
   DB_HOST=sqlXXX.infinityfree.com
   DB_NAME=if0_..._eduready
   DB_USER=if0_...
   DB_PASS=your_password
   ```

### Option B: Hardcoding in config.php
If the `.env` file is not working, you can edit `api/config.php` directly:
1. Open `api/config.php`.
2. Find the `__construct()` method and replace the fallback values:
   ```php
   $this->host = 'sqlXXX.infinityfree.com';
   $this->db_name = 'if0_..._eduready';
   $this->username = 'if0_...';
   $this->password = 'your_password';
   ```

## 4. Troubleshooting 403 Errors
If you still see a 403 Forbidden error:
1. Ensure the filename is `index.html` (all lowercase).
2. Ensure you are accessing your domain directly (e.g., `yourdomain.epizy.com`).
3. InfinityFree might take a few minutes to set up your domain.
4. Try clearing your browser cache.
