[ref](https://allanphilipbarku.medium.com/setup-automatic-local-domains-with-dnsmasq-on-macos-ventura-b4cd460d8cb3)

# Macos
```bash
brew install dnsmasq

# Configure dnsmasq
sudo vim $(brew --prefix)/etc/dnsmasq.conf

uncomment: conf-dir=/opt/homebrew/etc/dnsmasq.d/,*.conf

# Add dns record for dnsmasq
sudo bash -c "echo 'address=/digisense.dev/<ingress-endpoint>' > $(brew --prefix)/etc/dnsmasq.d/dev.conf"
sudo bash -c "echo 'address=/naaraan.dev/<ingress-endpoint>' >> $(brew --prefix)/etc/dnsmasq.d/dev.conf"

# Using Custom DNS (dnsmasq) for dev domain
sudo mkdir /etc/resolver/
# file with the name of the domain
sudo bash -c "echo 'nameserver 127.0.0.1' > /etc/resolver/digisense.dev 
sudo bash -c "echo 'nameserver 127.0.0.1' > /etc/resolver/naaraan.dev 

sudo brew services restart dnsmasq
```

# Linux
```bash
sudo rm /etc/resolv.conf

add `dns=dnsmasq` in [main]

sudo bash -c "echo 'address=/digisense.dev/<ingress-endpoint>' > /etc/NetworkManager/dnsmasq.d/dev.conf"
sudo bash -c "echo 'address=/naaraan.dev/<ingress-endpoint>' >> /etc/NetworkManager/dnsmasq.d/dev.conf"

sudo systemctl restart network-manager
```