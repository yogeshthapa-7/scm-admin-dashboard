import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Checkbox, Form, Input, message } from "antd";
import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

import loginBackground from "../assets/images/login_background.png";
import { login } from "./services/login.service";
// import type { LoginPayload } from "./types/auth.types";

interface LoginFormValues {
  userName: string;
  password: string;
  remember: boolean;
  // company: string;
}

/* Registration flow is temporarily disabled.
interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}
*/

interface LoginPageProps {
  onLogin?: (values: LoginFormValues) => Promise<void>;
}

// const COMPANIES = JSON.parse(import.meta.env.VITE_COMPANIES || "[]");
// const DEFAULT_COMPANY =
//   import.meta.env.VITE_DEFAULT_COMPANY || COMPANIES[0]?.id || "";

const LoginPage = ({ onLogin }: LoginPageProps) => {
  // const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm<LoginFormValues>();
  // const [registerForm] = Form.useForm<RegisterFormValues>();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname ||
    "/dashboard";

  const isLogin = true;

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      if (onLogin) {
        await onLogin(values);
        return;
      }

      const result = await login({
        userName: values.userName,
        password: values.password,
        remember: values.remember,
      });
      if (result.success) {
        message.success(
          `Login successful! Welcome back, ${result.user?.name || result.user?.username || values.userName}.`
        );
        navigate(from, { replace: true });
      } else {
        message.error(result.message || "Unable to sign in. Please try again.");
      }
    } catch {
      message.error("Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  /* const handleRegister = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      const result = await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        userName: values.userName,
        password: values.password,
        phoneNumber: values.phoneNumber,
      });

      if (result.success) {
        message.success(result.message || "Registration successful. You can now sign in.");
        registerForm.resetFields();
        loginForm.setFieldsValue({ userName: values.userName });
        setMode("login");
      } else {
        message.error(result.message || "Registration failed. Please try again.");
      }
    } catch {
      message.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }; */

  const handleForgotPassword = () => {
    message.info("Please contact your system administrator to reset your password.");
  };

  return (
    <div className="login-page min-h-screen w-full overflow-hidden font-['Inter','Segoe_UI',sans-serif] relative flex">
      <img
        src={loginBackground}
        alt="Login Background"
        className="login-background absolute inset-0 z-0 hidden h-full w-full object-cover lg:block"
      />
      <div className="login-background-overlay absolute inset-0 z-0" />

      <div className="login-brand-panel relative z-10 hidden w-1/2 lg:block" />

      <div className="relative z-10 flex h-screen flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
        <div className="login-card w-full max-w-[440px] rounded-[24px] border border-white/70 bg-white/[0.94] px-5 py-8 shadow-[0_24px_80px_rgba(5,25,70,0.28)] backdrop-blur-xl sm:px-9 sm:py-10">
          <div className="mx-auto mb-8 flex h-[6px] w-[96px] overflow-hidden rounded-full bg-[#dbeafe]">
            <span className="w-[40%] bg-[#38bdf8]" />
            <span className="w-[40%] bg-[#168bff]" />
            <span className="w-[20%] bg-[#0751df]" />
          </div>

          <div className="mb-8 text-center">
            <h1 className="m-0 mb-[10px] text-[32px] leading-[1.2] font-bold tracking-[-0.5px] text-[#102d60]">
              Welcome Back!
            </h1>
            <p className="m-0 text-[15px] leading-[1.6] font-normal text-[#6b7a9d]">
              Sign in to access your device management portal
            </p>
          </div>

          {isLogin ? (
            <Form
              form={loginForm}
              layout="vertical"
              requiredMark={false}
              onFinish={handleLogin}
              initialValues={{
                userName: "",
                password: "",
                remember: false,
                // company: DEFAULT_COMPANY,
              }}
              className="
                w-full
                [&_.ant-form-item]:mb-[12px]
                [&_.ant-input-affix-wrapper]:h-[38px]
                [&_.ant-input-affix-wrapper]:rounded-[8px]
                [&_.ant-input-affix-wrapper]:border-[1.5px]
                [&_.ant-input-affix-wrapper]:border-[#d1def2]
                [&_.ant-input-affix-wrapper]:bg-white
                [&_.ant-input-affix-wrapper]:px-[12px]
                [&_.ant-input-affix-wrapper]:shadow-none
                [&_.ant-input-prefix]:mr-[12px]
                [&_.ant-input-prefix]:text-[#3d5b89]
                [&_.ant-input]:bg-transparent
                [&_.ant-input]:text-[13px]
                [&_.ant-input]:text-[#17376c]
                [&_.ant-input::placeholder]:text-[#899bbd]
              "
            >
              <Form.Item
                name="userName"
                rules={[{ required: true, message: "Please enter your username" }]}
              >
                <Input
                  size="large"
                  prefix={<UserRound size={20} strokeWidth={1.8} />}
                  placeholder="Username"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please enter your password" }]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockKeyhole size={20} strokeWidth={1.8} />}
                  placeholder="Password"
                  autoComplete="current-password"
                  iconRender={(visible) => (visible ? <Eye size={18} /> : <EyeOff size={18} />)}
                />
              </Form.Item>

              {/* <Form.Item
                name="company"
                label="Company"
                rules={[{ required: true, message: "Please select a company" }]}
              >
                <Select size="large" placeholder="Select Company">
                  {COMPANIES.map((c: any) => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item> */}

              <div className="mb-8 mt-2 flex items-center justify-between gap-3">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-[15px] font-medium text-[#17376c]">
                    Remember Me
                  </Checkbox>
                </Form.Item>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[15px] font-medium text-[#0874f9] underline transition-colors hover:text-[#004fc7]"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<LogIn size={20} />}
                className="
                  !flex !h-[38px] !items-center !justify-center !gap-[10px]
                  !rounded-[12px] !border-0
                  !bg-gradient-to-r !from-[#168bff] !via-[#0862e9] !to-[#0648ca]
                  !text-[18px] !font-semibold !text-white
                "
              >
                Sign In
              </Button>
            </Form>
          ) : (
            /*
            <Form
              form={registerForm}
              layout="vertical"
              requiredMark={false}
              onFinish={handleRegister}
              className="
                w-full
                [&_.ant-form-item]:mb-[12px]
                [&_.ant-input-affix-wrapper]:h-[38px]
                [&_.ant-input-affix-wrapper]:rounded-[8px]
                [&_.ant-input-affix-wrapper]:border-[1.5px]
                [&_.ant-input-affix-wrapper]:border-[#d1def2]
                [&_.ant-input-affix-wrapper]:bg-white
                [&_.ant-input-affix-wrapper]:px-[12px]
                [&_.ant-input-affix-wrapper]:shadow-none
                [&_.ant-input-prefix]:mr-[12px]
                [&_.ant-input-prefix]:text-[#3d5b89]
                [&_.ant-input]:bg-transparent
                [&_.ant-input]:text-[13px]
                [&_.ant-input]:text-[#17376c]
                [&_.ant-input::placeholder]:text-[#899bbd]
              "
            >
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-3">
                <Form.Item
                  name="firstName"
                  rules={[{ required: true, message: "Please enter first name" }]}
                >
                  <Input
                    size="large"
                    prefix={<UserRound size={20} strokeWidth={1.8} />}
                    placeholder="First Name"
                    autoComplete="given-name"
                  />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  rules={[{ required: true, message: "Please enter last name" }]}
                >
                  <Input
                    size="large"
                    prefix={<UserRound size={20} strokeWidth={1.8} />}
                    placeholder="Last Name"
                    autoComplete="family-name"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  size="large"
                  prefix={<Mail size={20} strokeWidth={1.8} />}
                  placeholder="Email Address"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="userName"
                rules={[{ required: true, message: "Please enter username" }]}
              >
                <Input
                  size="large"
                  prefix={<UserRound size={20} strokeWidth={1.8} />}
                  placeholder="Username"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item name="phoneNumber">
                <Input
                  size="large"
                  prefix={<Phone size={20} strokeWidth={1.8} />}
                  placeholder="Phone Number (optional)"
                  autoComplete="tel"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockKeyhole size={20} strokeWidth={1.8} />}
                  placeholder="Password"
                  autoComplete="new-password"
                  iconRender={(visible) => (visible ? <Eye size={18} /> : <EyeOff size={18} />)}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockKeyhole size={20} strokeWidth={1.8} />}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  iconRender={(visible) => (visible ? <Eye size={18} /> : <EyeOff size={18} />)}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<UserPlus size={20} />}
                className="
                  !mt-2 !flex !h-[38px] !items-center !justify-center !gap-[10px]
                  !rounded-[12px] !border-0
                  !bg-gradient-to-r !from-[#168bff] !via-[#0862e9] !to-[#0648ca]
                  !text-[18px] !font-semibold !text-white
                "
              >
                Create Account
              </Button>
            </Form>
            */
            null
          )}

          <div className="mt-6 text-center">
            {/* Registration link intentionally disabled. */}
          </div>

          <div className="mt-8 pt-6 border-t border-[#d8e4f5]">
            <p className="m-0 whitespace-nowrap text-[13px] font-medium text-[#17376c] text-center">
              © {new Date().getFullYear()}. Device Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
