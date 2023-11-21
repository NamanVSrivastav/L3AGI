import { useEffect } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import Typography from '@l3-lib/ui-core/dist/Typography'

import Button from 'share-ui/components/Button/Button'
import Loader from 'share-ui/components/Loader/Loader'

import UploadedFile from 'components/UploadedFile'

import { useDatasourceForm } from './useDatasourceForm'
import UploadButton from './components/UploadButton'

import DataLoaderCard from './components/DataLoaderCard'
import FormikTextField from 'components/TextFieldFormik'
import { DATA_LOADER_IMAGES } from '../constants'
import { useDatasourceSqlTables } from 'services/datasource/useDatasourceSqlTables'
import DatasourceSqlTables from './components/DatasourceSqlTables/DatasourceSqlTables'
import { useParams } from 'react-router-dom'
import DataSourceDropdown from './components/DataSourceDropdown'
import TypographyPrimary from 'components/Typography/Primary'
import { ButtonPrimary } from 'components/Button/Button'
import TextareaFormik from 'components/TextareaFormik'

type DatasourceFormProps = {
  formik: any
  isLoading?: boolean
  isEdit?: boolean
}

const DatasourceForm = ({ formik, isLoading, isEdit = false }: DatasourceFormProps) => {
  const { t } = useTranslation()
  const { dataLoaders, pickedLoaderFields, handleUploadFile, fileLoading } =
    useDatasourceForm(formik)

  const { datasourceId } = useParams()

  const { category, fields } = pickedLoaderFields

  const { values, setFieldValue } = formik
  const {
    datasource_source_type,
    config_value,
    datasource_description,
    configs,
    index_type,
    response_mode,
    vector_store,
    files,
  } = values

  const { host, port, user, pass, name, tables } = values.configs

  const { data, fetchSqlTables, loading } = useDatasourceSqlTables({
    id: datasourceId,
    host: host?.value,
    port: port?.value && Number(port?.value),
    user: user?.value,
    password: pass?.value,
    name: name?.value,
    source_type: datasource_source_type,
  })

  const isDatabase = datasource_source_type === 'Postgres' || datasource_source_type === 'MySQL'

  useEffect(() => {
    if (isEdit && isDatabase) {
      fetchSqlTables()
    }
  }, [isEdit, isDatabase])

  useEffect(() => {
    if (datasource_source_type?.length > 0 && !isLoading && fields) {
      setFieldValue('config_key', pickedLoaderFields?.fields[0]?.key)
      setFieldValue('config_key_type', pickedLoaderFields?.fields[0]?.type)
    }
  }, [datasource_source_type])

  return (
    <StyledFormContainer>
      <StyledInputWrapper>
        <FormikTextField name='datasource_name' placeholder={t('name')} label={t('name')} />

        <TextareaFormik
          setFieldValue={setFieldValue}
          label={t('description')}
          value={datasource_description}
          fieldName={'datasource_description'}
        />

        <StyledSourceTypeWrapper>
          <TypographyPrimary
            value={t('source-type')}
            type={Typography.types.LABEL}
            size={Typography.sizes.md}
          />
          <StyledCardWrapper>
            {dataLoaders?.map((dataLoader: any) => {
              const filteredLogos = DATA_LOADER_IMAGES.filter(
                (loaderImages: any) => loaderImages.sourceName === dataLoader.source_type,
              )

              const imageSrc = filteredLogos?.[0]?.imageSrc || ''

              return (
                <DataLoaderCard
                  iconSrc={imageSrc}
                  isSelected={dataLoader.source_type === datasource_source_type}
                  isActive={dataLoader.is_active} // coming soon feature
                  key={dataLoader.name}
                  title={dataLoader.source_type}
                  onClick={() => {
                    setFieldValue('datasource_source_type', dataLoader.source_type)
                    setFieldValue('config_value', '')
                  }}
                />
              )
            })}
          </StyledCardWrapper>

          {category?.length > 0 && (
            <>
              {category === 'File' && (
                <StyledUploadFileWrapper>
                  <UploadButton onChange={handleUploadFile} isLoading={fileLoading} />

                  <StyledUploadedFiles>
                    {files?.length > 0 &&
                      files.map((file: any) => (
                        <UploadedFile
                          key={file.url}
                          id={file.url}
                          hasDeleteIcon
                          onClick={id => {
                            const filteredFiles = files.filter((file: any) => file.url !== id)
                            setFieldValue('files', filteredFiles)
                          }}
                          name={file.name}
                        />
                      ))}
                  </StyledUploadedFiles>

                  <DataSourceDropdown
                    onHelpClick={() =>
                      window.open(import.meta.env.REACT_APP_INDEX_TYPES_LINK, '_blank')
                    }
                    label={t('index-type')}
                    fieldName={'index_type'}
                    fieldValue={index_type}
                    setFieldValue={setFieldValue}
                    options={[
                      { label: `${t('summarize-index')}`, value: 'summary' },
                      { label: `${t('vector-store-index')}`, value: 'vector_store' },
                      { label: `${t('tree-index')}`, value: 'tree' },
                    ]}
                  />

                  {index_type === 'vector_store' && (
                    <DataSourceDropdown
                      onHelpClick={() =>
                        window.open(import.meta.env.REACT_APP_VECTOR_STORES_LINK, '_blank')
                      }
                      label={t('vector-store-provider')}
                      fieldName={'vector_store'}
                      fieldValue={vector_store}
                      setFieldValue={setFieldValue}
                      options={[
                        { label: `${t('zep')}`, value: 'zep' },
                        { label: `${t('pinecone')}`, value: 'pinecone' },
                        { label: `${t('weaviate')}`, value: 'weaviate' },
                      ]}
                    />
                  )}

                  <DataSourceDropdown
                    onHelpClick={() =>
                      window.open(import.meta.env.REACT_APP_RESPONSE_MODES_LINK, '_blank')
                    }
                    label={t('response-mode')}
                    fieldName={'response_mode'}
                    fieldValue={response_mode}
                    setFieldValue={setFieldValue}
                    options={[
                      { label: `${t('refine')}`, value: 'refine' },
                      { label: `${t('compact')}`, value: 'compact' },
                      { label: `${t('tree-summarize')}`, value: 'tree_summarize' },
                      { label: `${t('simple-summarize')}`, value: 'simple_summarize' },
                      { label: `${t('no-text')}`, value: 'no_text' },
                      { label: `${t('accumulate')}`, value: 'accumulate' },
                      { label: `${t('compact-accumulate')}`, value: 'compact_accumulate' },
                    ]}
                  />

                  <FormikTextField
                    name='chunk_size'
                    placeholder={t('chunk-size')}
                    label={t('chunk-size')}
                  />

                  {index_type === 'vector_store' && (
                    <FormikTextField
                      name='similarity_top_k'
                      placeholder={'2'}
                      label={t('similarity-top-k')}
                    />
                  )}
                </StyledUploadFileWrapper>
              )}

              {category === 'Database' &&
                fields.map((field: any) => (
                  <FormikTextField
                    key={field.key}
                    name={`configs.${field.key}.value`}
                    value={configs[field.key]?.value || ''}
                    placeholder={field.label}
                    label={field.label}
                  />
                ))}

              {category === 'Text' && (
                <TextareaFormik
                  setFieldValue={setFieldValue}
                  label={''}
                  value={config_value}
                  fieldName={'config_value'}
                />
              )}

              <>{category === 'Social' && <StyledText>{t('comingSoon')}</StyledText>}</>
              <>{category === 'Web Page' && <StyledText>{t('comingSoon')}</StyledText>}</>
              <>{category === 'Application' && <StyledText>{t('comingSoon')}</StyledText>}</>
            </>
          )}
        </StyledSourceTypeWrapper>

        {isDatabase && (
          <>
            {!isEdit && (
              <div>
                <ButtonPrimary
                  onClick={() => {
                    fetchSqlTables()
                  }}
                  disabled={loading || data}
                  size={Button.sizes?.SMALL}
                >
                  {loading ? <Loader size={32} /> : t('save')}
                </ButtonPrimary>
              </div>
            )}

            {data && (
              <DatasourceSqlTables
                data={data}
                tables={tables && JSON.parse(tables.value)}
                onTablesSelected={(selectedTables: string[]) => {
                  formik.setFieldValue('configs.tables', {
                    ...(tables || {}),
                    key: 'tables',
                    key_type: 'string',
                    value: JSON.stringify(selectedTables),
                    is_secret: false,
                    is_required: true,
                  })
                }}
              />
            )}
          </>
        )}
      </StyledInputWrapper>
    </StyledFormContainer>
  )
}

export default DatasourceForm

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  overflow-y: auto;
  height: 100%;
  width: 100%;
`

const StyledInputWrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: 25px;

  width: 100%;
  max-width: 800px;
  /* max-width: 600px; */
  /* margin: auto; */
  height: calc(100% - 100px);
  /* max-height: 800px; */

  padding: 0 20px;
`
const StyledSourceTypeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`
const StyledCardWrapper = styled.div`
  display: flex;

  align-items: center;
  gap: 12px;
  width: 100%;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
`
const StyledText = styled.span`
  color: #fff;
`
const StyledUploadFileWrapper = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: column;
`

const StyledUploadedFiles = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`
