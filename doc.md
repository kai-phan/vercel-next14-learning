# Instruction to set up the application on production server, EC2 instance, or any other server.

## Launch an EC2 instance on AWS.
- Choose an Amazon Machine Image (AMI) for the instance.
- Choose an instance type.(t2.micro)
- Create a new key pair or use an existing key pair.
- Network settings, using security groups, allow inbound traffic on port 80 (HTTP), 443 (HTTPS), and 22 (SSH) or any ports.
=> Depending on your supplier service, you may need to open the ports in the firewall.
- Launch the instance.

## Connect to the instance using SSH.
- Using the key pair, connect to the instance using SSH.
```bash
ssh -i "key.pem" (ec2-user | ubuntu)@{your-ec2-public-ip} 
```
- Using new user, create a new user and add the user to the sudo group.

## Nginx setup.
In your EC2 instance, you can install Nginx to serve the application.
- Install Nginx.
```bash
sudo apt update
sudo apt install nginx
```
- Check Nginx config.
```bash
nginx -t
```
- Start Nginx.
```bash
sudo systemctl start nginx
```
- Check Nginx process.
```bash
ps aux | grep nginx
```
- Check Nginx status.
```bash
sudo systemctl status nginx
```
- Adjust the firewall settings to allow Nginx. (In EC2 instance, you need to open the ports in the security group.)
```bash
sudo ufw app list
```

```text
Available applications:
  Nginx Full
  Nginx HTTP
  Nginx HTTPS
  OpenSSH
```

```bash
sudo ufw allow 'Nginx Full'
```

- If our EC2 public IP address `13.212.50.199` we can be able to access the application using `http://13.212.50.199
- If you have a domain, you can point the domain to the EC2 instance.

## Install the required software.
- Install `nvm`
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```
- Install `node`
```bash
nvm install --lts
```
- Install `yarn` if you prefer yarn.
```bash
npm install -g yarn
```
- Install `pm2`
```bash
npm install -g pm2
```

## Clone the application from the repository.
- Create ssh key pair.
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```
- Add the public key to the GitHub account.
- Clone the repository.

## Use pm2 to start application.
- Navigate to your project, install dependencies.
```bash
yarn install
```
- Create .env file.
```bash
cp .env.example .env
```
- Build the application.
```bash
yarn build
```
- Config Nginx to serve the application.
```bash
sudo nano /etc/nginx/nginx.conf
```
- Add the following configuration.
```text
server {
    listen 80;

    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- Reload Nginx.
```bash
sudo nginx -s reload
```

- Start the application using `npm` or `yarn`.
```bash
npm start | yarn start
```

- Use `pm2` to start the application.
```bash
pm2 start npm --name "app" -- run start
```

## SSL certificate setup with [Certbot](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal).
- Install `Snapd`.
```bash
sudo apt update
sudo apt install snapd
```
- If you already have `Certbot` installed, remove it.
```bash
sudo apt-get remove certbot
```

- Install `Certbot`.
```bash
sudo snap install --classic certbot
```

- Prepare the Certbot command.
```bash
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

- Obtain a certificate.
```bash
sudo certbot --nginx
```

- Test automatic renewal.
```bash
sudo certbot renew --dry-run
```

- Check the certificate.
```bash
sudo certbot certificates
```

- Update the Nginx configuration to use the certificate.
```bash
sudo nano /etc/nginx/nginx.conf
```

- Reload Nginx.
```bash
sudo nginx -s reload
```

- Http2 setup.
```bash
sudo nano /etc/nginx/nginx.conf
```

- Add the following configuration.
```text
listen 443 ssl http2;
```

[//]: # ()
[//]: # (5. Point the domain to the EC2 instance.)

[//]: # ()
[//]: # (6. SSL certificate setup with Certbot.)

[//]: # ()
[//]: # (8. Docker setup.)

[//]: # ()
[//]: # (9. CI/CD setup.)

[//]: # (10. Monitoring and logging setup.)

[//]: # ()
[//]: # (11. Backup and restore setup.)

[//]: # ()
[//]: # (12. Security setup.)

[//]: # ()
[//]: # (13. Performance optimization.)

[//]: # ()
[//]: # (14. Cost optimization.)

[//]: # ()
[//]: # (15. Scale the application.)

[//]: # ()
[//]: # (16. Disaster recovery setup.)

[//]: # ()
[//]: # (17. Documentation.)