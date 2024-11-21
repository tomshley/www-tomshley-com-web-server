### Test with IntelliJ
```shell
-Dfork=false
```
or in build.sbt:
```scala 3
run / fork = false
```

### Login to Cloudflared
```shell
brew install cloudflared
```
```shell
cloudflared tunnel login
```
```shell
cp ~/.cloudflared/cert.pem .secure_files/cloudflared.pem
```
```shell
cloudflared tunnel create www-tomshley-com-cloudflaredtunnel
```
```shell
cp ~/.cloudflared/<tunnel-id>.json .secure_files/.credentials.cloudflared.json
```
```shell
kubectl create secret generic tunnel-credentials \
--from-file=credentials.json=.secure_files/.credentials.cloudflared.json -n www-tomshley-com-web-server-namespace
```
```shell
cloudflared tunnel route dns www-tomshley-com-cloudflaredtunnel tomshley.com
cloudflared tunnel route dns www-tomshley-com-cloudflaredtunnel www.tomshley.com
```

### Setup Cluster Registry Auth
```shell
source ./.secure_files/.tfstate.env
```
```shell
export K8S_DOCKER_CONFIG_AUTH=$(echo "{ \"auths\": { \"https://$K8S_DOCKER_REGISTRY\":{ \"auth\":\"$(printf "$K8S_DOCKER_REGISTRY_USER:$K8S_DOCKER_REGISTRY_PASS" | openssl base64 -A)\" } }}")
export K8S_DOCKER_CONFIG_AUTH_BASE64=$(echo "$K8S_DOCKER_CONFIG_AUTH" | base64)
```

To Auth With Docker to Push
```shell
echo "$DOCKER_PUSH_REGISTRY_PASS" | docker logout $DOCKER_PUSH_REGISTRY
echo "$DOCKER_PUSH_REGISTRY_PASS" | docker login $DOCKER_PUSH_REGISTRY --username $DOCKER_PUSH_REGISTRY_USER --password-stdin
```

Push the latest build to dock
```shell
docker push registry.gitlab.com/tomshley/brands/usa/tomshleyllc/tech/www-tomshley-com-web-server/www-tomshley-com-web-server:latest
```

### Deploy The Service
```shell
kubectl delete namespace www-tomshley-com-web-server-namespace
kubectl apply -f kubernetes/namespace.json
kubectl config set-context --current --namespace=www-tomshley-com-web-server-namespace
kubectl create secret generic tunnel-credentials --from-file=credentials.json=.secure_files/.credentials.cloudflared.json -n www-tomshley-com-web-server-namespace
envsubst < kubernetes/credentials-registry.yml | kubectl apply -f -
kubectl apply -f kubernetes/rbac.yml
kubectl apply -f kubernetes/service.yml
kubectl apply -f kubernetes/deployment.yml
kubectl apply -f kubernetes/deployment-cloudflared.yml
```
#### Update the app
```shell
kubectl apply -f kubernetes/deployment.yml -n=www-tomshley-com-web-server-namespace
```
Tail logs
```shell
kubectl logs --follow -l app=www-tomshley-com-web-server --namespace=www-tomshley-com-web-server-namespace
```

Port forward the service
```shell
kubectl port-forward service/www-tomshley-com-web-server-nlb -n www-tomshley-com-web-server-namespace 8881:80
```
```shell
kubectl port-forward service/www-tomshley-com-web-server-k8service 8881:8080 -n www-tomshley-com-web-server-namespace
```
