import { Image } from 'antd'
import classNames from 'classnames';
import { useNavigate } from 'react-router';

type LogoHeaderProps = {
    size?: 'medium' | 'large';
    hiddenText?: boolean;
}

const LogoHeader = ({ size = 'medium', hiddenText = false }: LogoHeaderProps) => {
    const navigate = useNavigate();

    return (
        <div className='cursor-pointer' onClick={() => navigate('/', { replace: true })}>
            <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="logo" height={size === 'large' ? 43 : 24} width={size === 'large' ? 43 : 24} preview={false} />
                <div hidden={hiddenText} className={classNames("font-semibold", { 'text-xl': size === 'large', 'text-lg': size === 'medium' })}>Smart Greenhouse</div>
            </div>
        </div>
    )
}

export default LogoHeader;