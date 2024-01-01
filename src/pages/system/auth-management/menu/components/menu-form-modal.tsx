import { ModalForm, ProForm, ProFormRadio, ProFormSelect, ProFormSwitch, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { API } from '../../../../../api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAxios } from '../../../../../hooks/axios';
import { Alert, Spin } from 'antd';
import React from 'react';
import appRoutes from '../../../../../router/config';
import IconSelector from '../../../../../components/icon-selector';
import { useTranslation } from 'react-i18next';

export interface MenuFormModalProps {
    visible: boolean;
    parentId: number;
    record?: API.SysMenu;
    menuTree: API.SysMenu[];
    onOpenChange: (visible: boolean) => void;
    onFinish: () => void;
}

export const MenuFormModal: React.FC<MenuFormModalProps> = (props: MenuFormModalProps) => {
    const [type, setType] = useState(props.record?.type || API.SYS_MENU_TYPE.DIRECTORY);
    const [icon, setIcon] = useState(props.record?.icon);

    const permState = useAxios<API.Res<API.SysPermission[]>>({ url: API.URL.PERMISSION_LIST, method: 'get' });
    const saveRecordState = useAxios<API.Res<API.SysMenu>>({});

    const validationMsgs = useMemo(() => (saveRecordState.resp?.data as API.ValidError)?.errors || [], [saveRecordState.resp?.data]);

    const { t } = useTranslation();

    const onFinish = useCallback(
        async (value: object) => {
            const url = props.record ? `${API.URL.MENU_UPDATE}/${props.record.id}` : API.URL.MENU_CREATE;
            const res = await saveRecordState.fetchAsync({ url: url, method: 'post', data: { ...value, type, icon } });
            if (res?.code === API.CODE.SUCCESS) {
                props.onFinish();
                return true;
            }
            return false;
        },
        [icon, saveRecordState, props, type]
    );

    const routesWithAbsolutePath = useMemo(() => {
        if (!appRoutes) return [];
        const getRoute = (arr: any[]) => {
            const result: any[] = [];
            arr.forEach((item) => {
                if (item.path === '' || item.path === '*') return;
                let children = undefined;
                if (item.children) children = getRoute(item.children);
                result.push({ label: item.path, value: item.path, children: children });
            });
            return result;
        };
        return getRoute(appRoutes);
    }, []);

    useEffect(
        () => {
            if (props.visible) {
                permState.fetch();
                setIcon(props.record?.icon);
                setType(props.record?.type || API.SYS_MENU_TYPE.DIRECTORY);
            } else {
                saveRecordState.reset();
                permState.reset();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props]
    );

    return (
        <Spin spinning={permState.loading || saveRecordState.loading}>
            <ModalForm
                modalProps={{ destroyOnClose: true, getContainer: false }}
                initialValues={{
                    ...props.record,
                    hidden: props.record?.hidden == 1,
                    permissionIds: props.record?.permissions?.map((item) => {
                        return item.id;
                    }),
                    parentId: props.parentId > 0 ? props.parentId : props.record?.parentId != 0 ? props.record?.parentId : undefined,
                }}
                submitTimeout={1000}
                open={props.visible}
                onFinish={onFinish}
                onOpenChange={props.onOpenChange}
            >
                <ProForm.Group>
                    <ProFormRadio.Group
                        name='type'
                        label={t('form.common.type')}
                        style={{
                            margin: 16,
                        }}
                        radioType='button'
                        fieldProps={{
                            defaultValue: type,
                            onChange: (e) => setType(e.target.value),
                        }}
                        options={[
                            { label: t('form.menu.type.directory'), value: API.SYS_MENU_TYPE.DIRECTORY },
                            { label: t('form.menu.type.page'), value: API.SYS_MENU_TYPE.PAGE },
                            { label: t('form.menu.type.operation'), value: API.SYS_MENU_TYPE.OPERATION },
                        ]}
                        disabled={props.record != null}
                        required
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        name='name'
                        width='md'
                        label={t('form.common.name')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 8 }, { min: 2 }, { required: true }]}
                        required
                    />
                    <ProFormTreeSelect
                        name='parentId'
                        label={t('form.menu.parentNode')}
                        placeholder={t('hint.pleaseSelect')}
                        allowClear
                        width='md'
                        // tree-select args
                        fieldProps={{
                            filterTreeNode: true,
                            showSearch: true,
                            popupMatchSelectWidth: false,
                            treeNodeFilterProp: 'id',
                            treeNodeLabelProp: 'name',
                            fieldNames: {
                                label: 'name',
                                value: 'id',
                            },
                            treeDefaultExpandAll: true,
                            treeData: props.menuTree,
                        }}
                        rules={[{ required: type === API.SYS_MENU_TYPE.OPERATION }]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        name='sortWeight'
                        width='md'
                        label={t('form.menu.order')}
                        placeholder={t('hint.pleaseInput')}
                        fieldProps={{ type: 'number' }}
                    />
                    {type != API.SYS_MENU_TYPE.OPERATION && (
                        <ProForm.Item label={t('form.menu.icon')}>
                            <IconSelector iconType={'Outlined'} defaultValue={icon} setValue={setIcon} />
                        </ProForm.Item>
                    )}
                </ProForm.Group>
                <ProForm.Group>{type != API.SYS_MENU_TYPE.OPERATION && <ProFormSwitch name='hidden' label={t('form.menu.hidden')} />}</ProForm.Group>
                <ProForm.Group>
                    {type == API.SYS_MENU_TYPE.PAGE && (
                        <ProFormTreeSelect
                            name='path'
                            label={t('form.menu.path')}
                            placeholder={t('hint.pleaseInput')}
                            width='md'
                            // tree-select args
                            fieldProps={{
                                filterTreeNode: true,
                                showSearch: true,
                                popupMatchSelectWidth: false,
                                treeDefaultExpandAll: true,
                                treeData: routesWithAbsolutePath,
                            }}
                            rules={[{ required: true }]}
                        />
                    )}
                    {type == API.SYS_MENU_TYPE.OPERATION && (
                        <ProFormSelect
                            name='permissionIds'
                            width='xl'
                            label={t('form.menu.permissions')}
                            fieldProps={{
                                mode: 'multiple',
                                placeholder: t('hint.pleaseSelect'),
                                loading: permState.loading,
                            }}
                            options={permState.resp?.data?.map((item) => {
                                return { label: item.name, value: item.id };
                            })}
                            required
                        />
                    )}
                </ProForm.Group>
                {validationMsgs &&
                    validationMsgs.map((msg) => (
                        <Alert
                            style={{
                                marginBottom: 24,
                            }}
                            key={msg}
                            message={msg}
                            type='error'
                            showIcon
                        />
                    ))}
            </ModalForm>
        </Spin>
    );
};
