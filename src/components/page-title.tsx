interface PageHeaderProps {
  title?: string
}
export  function PageTitle({ title = "Title" }: React.PropsWithChildren<PageHeaderProps>) {
  return(
          <div className="flex w-full items-center justify-between">
            <h1 className='text-2xl'>{title}</h1>
          </div>
        )
}
export default PageTitle;