import AuthForm from "../components/AuthForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();

  return <AuthForm mode="login" onSubmit={login} />;
};

export default Login;
