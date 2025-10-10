openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -subj '/O=naaraan Inc./CN=naaraan.com' -keyout naaraan.com.key -out naaraan.com.crt

openssl req -out dummy.naaraan.com.csr -newkey rsa:2048 -nodes -keyout dummy.naaraan.com.key -subj "/CN=*.naaraan.com/O=dummy organization"

openssl x509 -req -sha256 -days 365 -CA naaraan.com.crt -CAkey naaraan.com.key -set_serial 0 -in dummy.naaraan.com.csr -out dummy.naaraan.com.crt

kubectl delete secret dummy-credential
kubectl create secret tls dummy-credential \
--key=dummy.naaraan.com.key \
--cert=dummy.naaraan.com.crt