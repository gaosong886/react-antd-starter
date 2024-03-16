import { ModalForm, ProForm, ProFormRadio, ProFormSelect, ProFormSwitch, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAxios } from '../../../../../hooks/axios';
import { Alert, Spin } from 'antd';
import React from 'react';
import appRoutes from '../../../../../router/config';
import IconSelector from '../../../../../components/icon-selector';
import { useTranslation } from 'react-i18next';
import { ResCode, Res, SysMenuType, SysMenu, SysPermission, ValidError } from '../../../../../api/types';
import { API } from '../../../../../api/constants';

export interface MenuFormModalProps {
    visible: boolean;
    parentId: number;
    record?: SysMenu;
    menuTree: SysMenu[];
    onOpenChange: (visible: boolean) => void;
    onFinish: () => void;
}

export const MenuFormModal: React.FC<MenuFormModalProps> = (props: MenuFormModalProps) => {
    const { t } = useTranslation();

    // 当前记录的节点类型
    const [type, setType] = useState(props.record?.type || SysMenuType.DIRECTORY);

    // 当前选中的图标
    const [icon, setIcon] = useState(props.record?.icon);

    // 权限列表请求状态对象
    const permissionReqState = useAxios<Res<SysPermission[]>>({ url: API.PERMISSION_LIST, method: 'get' });

    // '保存' 请求状态对象
    const saveReqState = useAxios<Res<SysMenu>>({});

    // 后端返回的校验错误信息
    const validErrors = useMemo(() => (saveReqState.resp?.data as ValidError)?.errors || [], [saveReqState.resp?.data]);

    // 父节点的 id
    const parentId = useMemo(() => {
        // '新增' 的场合，使用从 props 中传过来的 parentId 作为初始值
        if (props.parentId > 0)
            return props.parentId;

        // '编辑' 的场合，使用 record 里面的值
        if (props.record?.parentId != 0)
            return props.record?.parentId;

        // 没有父节点的场合
        return undefined;
    }, [props.parentId, props.record?.parentId]);

    // 保存
    const onFinish = useCallback(
        async (value: object) => {
            const url = props.record ? `${API.MENU_UPDATE}/${props.record.id}` : API.MENU_CREATE;
            const res = await saveReqState.fetchAsync({ url: url, method: 'post', data: { ...value, type, icon } });
            // 保存成功时关闭 Modal
            if (res?.code === ResCode.SUCCESS) {
                props.onFinish();
                return true;
            }
            return false;
        },
        [icon, saveReqState, props, type]
    );

    // 根据项目路由拼装 TreeSelect 控件的数据
    const routesWithAbsolutePath = useMemo(() => {
        if (!appRoutes) return [];

        // 递归生成路由树
        const getRoute = (arr: any[]) => {
            const result: any[] = [];
            arr.forEach((item) => {
                // 跳过空路径和通配符
                if (!item.path || item.path === '*') return;

                let children = undefined;
                if (item.children) children = getRoute(item.children);
                result.push({ label: item.path, value: item.path, children: children });
            });
            return result;
        };
        return getRoute(appRoutes);
    }, []);

    // 初始化 Modal
    useEffect(
        () => {
            if (props.visible) {
                permissionReqState.fetch();
                setIcon(props.record?.icon);
                setType(props.record?.type || SysMenuType.DIRECTORY);
            } else {
                saveReqState.reset();
                permissionReqState.reset();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props]
    );

    return (
        <Spin spinning={permissionReqState.loading || saveReqState.loading}>
            <ModalForm
                modalProps={{ destroyOnClose: true, getContainer: false }}
                initialValues={{
                    ...props.record,
                    hidden: props.record?.hidden == 1,
                    permissionIds: props.record?.permissions?.map((item) => {
                        return item.id;
                    }),
                    parentId: parentId,
                }}
                submitTimeout={1000}
                open={props.visible}
                onFinish={onFinish}
                onOpenChange={props.onOpenChange}
            >
                <ProForm.Group>
                    <ProFormRadio.Group
                        label={t('form.common.type')}
                        style={{
                            margin: 16,
                        }}
                        radioType='button'
                        fieldProps={{
                            name: 'type',
                            defaultValue: type,
                            onChange: (e) => setType(e.target.value),
                        }}
                        options={[
                            { label: t('form.menu.type.directory'), value: SysMenuType.DIRECTORY },
                            { label: t('form.menu.type.page'), value: SysMenuType.PAGE },
                            { label: t('form.menu.type.operation'), value: SysMenuType.OPERATION },
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
                        rules={[{ max: 15 }, { min: 2 }, { required: true }]}
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
                        rules={[{ required: type === SysMenuType.OPERATION }]}
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
                    {type != SysMenuType.OPERATION && (
                        <ProForm.Item label={t('form.menu.icon')}>
                            <IconSelector iconType={'Outlined'} defaultValue={icon} setValue={setIcon} />
                        </ProForm.Item>
                    )}
                </ProForm.Group>
                <ProForm.Group>{type != SysMenuType.OPERATION && <ProFormSwitch name='hidden' label={t('form.menu.hidden')} />}</ProForm.Group>
                <ProForm.Group>
                    {type == SysMenuType.PAGE && (
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
                    {type == SysMenuType.OPERATION && (
                        <ProFormSelect
                            name='permissionIds'
                            width='xl'
                            label={t('form.menu.permissions')}
                            fieldProps={{
                                mode: 'multiple',
                                placeholder: t('hint.pleaseSelect'),
                                loading: permissionReqState.loading,
                            }}
                            options={permissionReqState.resp?.data?.map((item) => {
                                return { label: item.name, value: item.id };
                            })}
                            required
                        />
                    )}
                </ProForm.Group>
                {validErrors &&
                    validErrors.map((msg) => (
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
