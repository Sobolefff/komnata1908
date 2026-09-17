import tgPath from '../../images/icons/tg.png';
import instPath from '../../images/icons/inst.png';
import waPath from '../../images/icons/wa.png';

const links = [
    {
        href: 'https://instagram.com/komnata_1908?igshid=YmMyMTA2M2Y=',
        icon: instPath,
        alt: 'иконка Instagram',
    },
    {
        href: 'https://t.me/komnata1908',
        icon: tgPath,
        alt: 'иконка Telegram',
    },
    {
        href: 'whatsapp://send?phone=79650726145',
        icon: waPath,
        alt: 'иконка WhatsApp',
    },
];

export default function SocialLinks({ listClassName, itemClassName }) {
    return (
        <ul className={listClassName}>
            {links.map((link) => (
                <li className={itemClassName} key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                        <img src={link.icon} alt={link.alt} />
                    </a>
                </li>
            ))}
        </ul>
    );
}
