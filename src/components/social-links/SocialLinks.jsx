import tgPath from '../../images/icons/tg.png';
import instPath from '../../images/icons/inst.png';
import waPath from '../../images/icons/wa.png';
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function SocialLinks({ listClassName, itemClassName }) {
    const { links } = useSiteConfig();
    const items = [
        { key: 'instagram', href: links.instagram, icon: instPath, alt: 'иконка Instagram' },
        { key: 'telegram', href: links.telegram, icon: tgPath, alt: 'иконка Telegram' },
        { key: 'whatsapp', href: links.whatsapp, icon: waPath, alt: 'иконка WhatsApp' },
    ];

    return (
        <ul className={listClassName}>
            {items.map((link) => (
                <li className={itemClassName} key={link.key}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                        <img src={link.icon} alt={link.alt} />
                    </a>
                </li>
            ))}
        </ul>
    );
}
