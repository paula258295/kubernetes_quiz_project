kubectl create secret generic auth-secrets \
  --from-literal=GOOGLE_CLIENT_ID=your_id \
  --from-literal=GOOGLE_CLIENT_SECRET=your_secret \
  --from-literal=SESSION_SECRET=your_session_secret
kubectl create secret generic quiz-secrets \
  --from-literal=JWT_SECRET=your_jwt_secret

kubectl apply -f k8s/

kubectl port-forward svc/frontend 3000:3000
kubectl port-forward svc/proxy 3001:3001