import '../../packages/ckeditor5/styles.css'

import { CKEditor } from '@ckeditor/ckeditor5-react'

import {simpleUploadConfig} from '../lib/data/api'

let ClassicEditor: any = {
  getData: () => {return 'test'},
  setData: (data: string) => {return data}
}
if(import.meta.env.VITE_APP_ENV !='testing'){
  import('ckeditor5-custom-build/build/ckeditor').then(module => {
    ClassicEditor = module.default;
  });
}

interface CKEditorProps {
  id: string;
  data: string;
  onChange: (event: any, editor: any) => void; // You should replace 'any' with the actual type of the event and editor
  onReady?: (editor: any) => void; // You should replace 'any' with the actual type of the editor
}
export const CKWrapper = (props: CKEditorProps) => {
  const { id, data, onChange, onReady } = props;
  return (
    
    <CKEditor
      id={id}
      data = {data}
      editor={ClassicEditor}
      onChange={(event, editor) => {
        onChange(String(id), editor.getData());
      }}
      onReady={ editor => {
            if (data) editor.setData(data)
        }}
      // I have no idea why this works. Lots of conflicting advice on stackoverflow  //
      // https://stackoverflow.com/questions/74559310/uncaught-syntaxerror-the-requested-module-ckeditor5-build-ckeditor-js-does-n 
      
      config={{
                simpleUpload: simpleUploadConfig(), 
                image: {upload: {types: [ 'png', 'jpeg','gif' ]}}
              }}
    
    />
  )
}

export default CKWrapper;