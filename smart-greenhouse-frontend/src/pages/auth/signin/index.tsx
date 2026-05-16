import { Form } from "antd";
import { useLogin } from "@refinedev/core";
import { useNavigate } from "react-router";
import { CloseOutlined } from "@ant-design/icons";
import LogoHeader from "../../../components/LogoHeader";
import InputAnt from "../../../components/InputAnt";
import PassAnt from "../../../components/PassAnt";
import ButtonAnt from "../../../components/ButtonAnt";
import { ISignInParams } from "@/models/auth.type";
import { useSignIn } from "./api";
import { useNotificationProvider } from "@/providers/notification";

export const SignIn: React.FC = () => {
    const { signIn, isLoading: isLoadingSignIn } = useSignIn();
    const { mutate: login } = useLogin();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const notificationProvider = useNotificationProvider();

    const handleSignIn = async (values: ISignInParams) => {
        const res = await signIn(values);
        const data = res?.data;
        const { DT, EC, EM } = data || {};
        console.log('EC', EC);
        if(EC === 0) {
            await login(DT);
        }else {
            console.log('Sign in failed:', EM);
            notificationProvider.open({
                type: 'error',
                message: EM || 'Sign in failed!',
            });
        }
    }

    return (
        <div className="h-screen flex flex-col bg-greenhouse-background justify-center items-center px-4 sm:px-0">
            <div className='w-full sm:w-[545px]'>
                <div className="flex justify-between items-center pb-8">
                    <LogoHeader size="large" />
                    <CloseOutlined className="text-lg text-gray-600 cursor-pointer" onClick={() => navigate('/', { replace: true })} />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 w-full">
                    <div className="text-2xl font-medium">Login to your account</div>
                    <Form
                        form={form}
                        onFinish={handleSignIn}
                        className="flex flex-col gap-1 pt-6"
                        layout="vertical"
                    >
                        <div className="my-1">Email</div>
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: "" }]}
                        >
                            <InputAnt placeholder="name@work-email.com" className="w-full text-sm" />
                        </Form.Item>

                        <div className="flex justify-between items-center mb-1">
                            <span>Password</span>
                        </div>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "" }]}
                        >
                            <PassAnt type="password" placeholder="password" className="w-full text-sm" />
                        </Form.Item>

                        <Form.Item>
                            <ButtonAnt type="primary" htmlType="submit" className="w-full" loading={isLoadingSignIn}>
                                Sign in with Email
                            </ButtonAnt>
                        </Form.Item>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-gray-300" />
                            <div className="text-gray-500 text-sm font-medium">OR</div>
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        <div className="pt-4">
                            <ButtonAnt type="default" className="w-full" >
                                <img src="/icon-google.png" className="!w-6 !h-6" />
                                <div>Sign in with Google</div>
                            </ButtonAnt>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};
