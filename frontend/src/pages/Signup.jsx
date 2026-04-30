import AuthForm from "../components/AuthForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Signup = () => {
  const { signup } = useAuth();

  return <AuthForm mode="signup" onSubmit={signup} />;
};

export default Signup;
