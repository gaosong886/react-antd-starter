import { Card, Dropdown, Flex } from 'antd';
import Icon from '@ant-design/icons';
import * as icons from '@ant-design/icons';
import { CSSProperties, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface IconSelectorProps {
    iconType: 'Filled' | 'Outlined' | 'TwoTone';
    defaultValue?: string;
    dropdownStyle?: CSSProperties;
    placement?: 'bottom' | 'top' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
    iconStyle?: CSSProperties;
    setValue?: (value: string) => void;
}

/**
 * Antd 图标选择器组件
 */
const IconSelector = (props: IconSelectorProps) => {
    const { iconType, defaultValue, dropdownStyle, placement, iconStyle, setValue } = props;

    // 读取 Antd 的图标库
    const iconKeys = useMemo(
        () => Object.keys(icons).filter((item) => typeof (icons as any)[item] === 'object' && item !== 'default' && item.includes(iconType)),
        [iconType]
    );
    const [selectedValue, setSelectedValue] = useState(defaultValue);
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    const onClick = (item: string) => {
        setSelectedValue(item);
        if (setValue) setValue(item);
        setOpen(false);
    };

    const render = () => {
        return (
            <Card style={{ width: 600, ...dropdownStyle }}>
                <Flex wrap='wrap' gap='small'>
                    {iconKeys.map((key) => {
                        const component = (icons as any)[key];
                        return (
                            <Icon
                                key={key}
                                onClick={() => {
                                    onClick(key);
                                }}
                                component={component}
                                style={{ marginRight: '8px', ...iconStyle }}
                            />
                        );
                    })}
                </Flex>
            </Card>
        );
    };

    return (
        <>
            <Dropdown open={open} onOpenChange={setOpen} trigger={['click']} dropdownRender={render} placement={placement}>
                <a onClick={(e) => e.preventDefault()}>
                    {!selectedValue && t('hint.pleaseSelect')}
                    {selectedValue && <Icon component={(icons as any)[selectedValue]} style={{ fontSize: '18px', marginRight: '8px' }} />}
                </a>
            </Dropdown>
        </>
    );
};

export default IconSelector;
