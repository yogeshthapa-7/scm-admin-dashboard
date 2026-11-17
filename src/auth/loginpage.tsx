import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  message,
} from "antd";

import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

import loginBackground from "../assets/images/login_background.png";

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
  company: string;
}

interface LoginPageProps {
  onLogin?: (values: LoginFormValues) => Promise<void>;
}

const COMPANIES = JSON.parse(import.meta.env.VITE_COMPANIES || '[]');

const MOCK_USER = {
  username: "admin",
  password: "admin@123",
};

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 600));

      if (onLogin) {
        await onLogin(values);
      } else if (
        values.username === MOCK_USER.username &&
        values.password === MOCK_USER.password
      ) {
        localStorage.setItem("scm_auth", "true");
        localStorage.setItem("scm_company", values.company);
        message.success(`Login successful! Welcome back, ${values.username}.`);
        navigate("/dashboard", { replace: true });
      } else {
        message.error("Invalid username or password. Try admin / admin@123");
      }
    } catch (error) {
      message.error("Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    message.info("Please contact your system administrator to reset your password.");
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#eef2f7] via-[#ffffff] to-[#f5f7fa] font-['Inter','Segoe_UI',sans-serif] relative flex">

      {/* FULL PAGE BACKGROUND IMAGE */}
      <img
        src={loginBackground}
        alt="Login Background"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-[0.5]"
      />

      {/* LEFT SPACER (pushes login form to the right side) */}
      <div className="w-full md:w-[50%] hidden md:block flex items-center justify-end px-[40px] py-[20px]">
        <div className="w-full max-w-[320px] text-right">
          
        </div>
      </div>

      {/* LOGIN CARD (right side) */}
      <div className="flex-1 h-screen overflow-y-hidden items-center justify-center px-[40px] py-[20px] md:px-[80px] md:py-[40px] relative z-10">
        <div className="w-full max-w-[420px] flex-col rounded-[24px] border-[1.5px] border-[#ffffff]/[0.4] bg-white/[0.9] shadow-[0_24px_48px_rgba(16,45,96,0.15)] backdrop-blur-sm px-[36px] py-[44px]">
          <div className="mx-auto mb-8 flex h-[6px] w-[96px] overflow-hidden rounded-full bg-[#dbeafe]">
            <span className="w-[40%] bg-[#38bdf8]" />
            <span className="w-[40%] bg-[#168bff]" />
            <span className="w-[20%] bg-[#0751df]" />
          </div>

          <div className="mb-12 text-center">
            <h1 className="m-0 mb-[10px] text-[32px] leading-[1.2] font-bold tracking-[-0.5px] text-[#102d60]">
              Welcome Back!
            </h1>
            <p className="m-0 text-[15px] leading-[1.6] font-normal text-[#6b7a9d]">
              Sign in to access your device management portal
            </p>
          </div>

          <Form
            layout="vertical"
            requiredMark={false}
            onFinish={handleLogin}
            initialValues={{
              username: "",
              password: "",
              remember: false,
              company: "",
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
              [&_.ant-input-affix-wrapper]:transition-all
              [&_.ant-input-affix-wrapper:hover]:border-[#80b5ff]
              [&_.ant-input-affix-wrapper-focused]:border-[#1677ff]
              [&_.ant-input-affix-wrapper-focused]:shadow-[0_0_0_3px_rgba(22,119,255,0.09)]

              [&_.ant-input-prefix]:mr-[12px]
              [&_.ant-input-prefix]:text-[#3d5b89]

              [&_.ant-select-selector]:h-[38px]
              [&_.ant-select-selector]:rounded-[8px]
              [&_.ant-select-selector]:border-[1.5px]
              [&_.ant-select-selector]:border-[#d1def2]
              [&_.ant-select-selector]:bg-white
              [&_.ant-select-selector]:px-[12px]
              [&_.ant-select-selector]:shadow-none
              [&_.ant-select-selector]:transition-all
              [&_.ant-select-selector:hover]:border-[#80b5ff]
              [&_.ant-select-focused]:border-[#1677ff]
              [&_.ant-select-focused]:shadow-[0_0_0_3px_rgba(22,119,255,0.09)]

              [&_.ant-input]:bg-transparent
              [&_.ant-input]:text-[13px]
              [&_.ant-input]:text-[#17376c]
              [&_.ant-input::placeholder]:text-[#899bbd]

              [&_.ant-select-selection-item]:text-[13px]
              [&_.ant-select-selection-item]:text-[#17376c]
              [&_.ant-select-selection-placeholder]:text-[#899bbd]

              [&_.ant-input-password-icon]:text-[#526c96]
              [&_.ant-input-password-icon]:text-[16px]
            "
          >

            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please enter your username or email address",
                },
              ]}
            >
              <Input
                size="large"
                prefix={<UserRound size={20} strokeWidth={1.8} />}
                placeholder="Username or Email Address"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password",
                },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockKeyhole size={20} strokeWidth={1.8} />}
                placeholder="Password"
                autoComplete="current-password"
                iconRender={(visible) =>
                  visible ? <Eye size={18} /> : <EyeOff size={18} />
                }
              />
            </Form.Item>

            <Form.Item
              name="company"
              label="Company"
              rules={[
                {
                  required: true,
                  message: "Please select a company",
                },
              ]}
            >
              <Select size="large" placeholder="Select Company">
                {COMPANIES.map((c: any) => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div className="mb-8 mt-2 flex items-center justify-between gap-3">
              <Form.Item
                name="remember"
                valuePropName="checked"
                noStyle
              >
                <Checkbox
                  className="
                    text-[15px] font-medium text-[#17376c]
                    [&_.ant-checkbox-inner]:h-[20px]
                    [&_.ant-checkbox-inner]:w-[20px]
                    [&_.ant-checkbox-inner]:rounded-[5px]
                    [&_.ant-checkbox-inner]:border-[#7793c1]
                    [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[#1677ff]
                    [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[#1677ff]
                    [&_.ant-checkbox+span]:ps-[10px]
                  "
                >
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
                !shadow-[0_7px_15px_rgba(0,93,230,0.12)]
                !transition-all !duration-300
                hover:!-translate-y-[1px]
                hover:!bg-gradient-to-r
                hover:!from-[#0879f5]
                hover:!to-[#064fcf]
                hover:!shadow-[0_10px_20px_rgba(0,93,230,0.2)]
              "
            >
              Sign In
            </Button>

          </Form>

          <div className="mt-12 pt-10 border-t border-[#d8e4f5]">
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
