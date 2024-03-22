import { ModalForm, ProForm, ProFormSelect, ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAxios } from '../../../../../hooks/axios';
import { Alert, Spin, Upload, UploadFile } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';
import { ResCode, Res, SysRole, SysUser, ValidError } from '../../../../../api/types';
import { API } from '../../../../../api/constants';

export interface UserFormModalProps {
    visible: boolean;
    record?: SysUser;
    onOpenChange: (visible: boolean) => void;
    onFinish: () => void;
}

/**
 * 用户管理弹窗
 */
export const UserFormModal: React.FC<UserFormModalProps> = (props: UserFormModalProps) => {
    const { t } = useTranslation();

    // 获取角色列表请求状态对象
    const roleReqState = useAxios<Res<SysRole[]>>({ url: API.ROLE_LIST, method: 'get', manual: false });

    // 上传照片请求状态对象
    const photoReqState = useAxios<Res<UploadFile>>({ url: API.USER_PHOTO, method: 'post' });

    // '保存' 请求状态对象
    const saveReqRecordState = useAxios<Res<SysUser>>({});

    // 上传照片相关状态
    const [photoUrl, setPhotoUrl] = useState<string>(props.record?.photo || '');
    const [uploadError, setUploadError] = useState('');

    // 上传文件列表，给 Upload 控件初始化用
    const uploadedFileList = useMemo((): UploadFile<any>[] => {
        return photoUrl ? [{ status: 'done', uid: 'photo', name: 'photo', url: photoUrl }] : [];
    }, [photoUrl]);

    // 服务端回传的表单校验错误信息
    const validErrors = useMemo(() => (saveReqRecordState.resp?.data as ValidError)?.errors || [], [saveReqRecordState.resp?.data]);

    // Upload 控件的自定义上传请求
    const uploadRequest = useCallback(
        async (options: any) => {
            const { file } = options;

            const formData = new FormData();
            formData.append('file', file);

            photoReqState.fetch({
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadError('');
        },
        [photoReqState]
    );

    // 保存
    const onFinish = useCallback(
        async (value: any) => {
            const url = props.record ? `${API.USER_UPDATE}/${props.record.id}` : API.USER_CREATE;
            const res = await saveReqRecordState.fetch({
                url: url,
                method: 'post',
                data: { ...value, photo: photoUrl, accountStatus: value.accountStatus ? -1 : 0 },
            });

            // 成功后关闭 Modal
            if (res?.code === ResCode.SUCCESS) {
                props.onFinish();
                return true;
            }
            return false;
        },
        [photoUrl, props, saveReqRecordState]
    );

    // 照片上传前进行本地检查
    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            setUploadError(t('hint.profilePhotoWrongType'));
        }
        const isLt2M = file.size / 1024 < 300;
        if (!isLt2M) {
            setUploadError(t('hint.profilePhotoWrongSize'));
        }
        return isJpgOrPng && isLt2M;
    };

    // 数据初始化
    useEffect(() => {
        saveReqRecordState.reset();
        setUploadError('');
        setPhotoUrl(props.record?.photo || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props]);

    // 头像地址永远用最新上传的那个
    useEffect(() => {
        if (photoReqState.resp?.data?.url) setPhotoUrl(photoReqState.resp?.data?.url);
    }, [photoReqState.resp?.data?.url]);

    return (
        <Spin spinning={roleReqState.loading || saveReqRecordState.loading || photoReqState.loading}>
            <ModalForm
                modalProps={{ destroyOnClose: true, getContainer: false }}
                initialValues={{
                    ...props.record,
                    roleIds: props.record?.roles.map((item) => {
                        return item.id;
                    }),
                }}
                submitTimeout={1000}
                open={props.visible}
                onFinish={onFinish}
                onOpenChange={props.onOpenChange}
            >
                <ProForm.Group>
                    <ProForm.Item label={t('form.user.photo')} tooltip={t('hint.profilePhoto')} required>
                        <Upload
                            id='upload'
                            name='upload'
                            accept='image/png, image/jpeg'
                            action={API.USER_PHOTO}
                            listType='picture-circle'
                            maxCount={1}
                            customRequest={uploadRequest}
                            fileList={uploadedFileList}
                            beforeUpload={beforeUpload}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>{t('function.upload')}</div>
                            </div>
                        </Upload>
                        {uploadError && <Alert message={uploadError} type='error' showIcon />}
                    </ProForm.Item>
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        name='username'
                        width='md'
                        label={t('form.user.username')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 15 }, { min: 5 }, { required: true }]}
                        required
                    />
                    <ProFormText.Password
                        name='password'
                        width='md'
                        label={t('form.user.password')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 15 }, { min: 8 }]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        name='nickname'
                        width='md'
                        label={t('form.user.nickname')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 15 }, { min: 2 }, { required: true }]}
                        required
                    />
                    <ProFormText
                        name='remark'
                        width='md'
                        label={t('form.common.remark')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 255 }, { min: 2 }]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormSelect
                        name='roleIds'
                        width='md'
                        label={t('form.user.roles')}
                        fieldProps={{
                            mode: 'multiple',
                            placeholder: t('hint.pleaseSelect'),
                            loading: roleReqState.loading,
                        }}
                        options={roleReqState.resp?.data?.map((item) => {
                            return { label: item.name, value: item.id };
                        })}
                        required
                    />
                </ProForm.Group>
                {props.record && (
                    <ProForm.Group>
                        <ProFormSwitch name='accountStatus' label={t('status.banned')} />
                    </ProForm.Group>
                )}
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
