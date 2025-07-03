import Loader from '../Loader/loader'
import classes from './loadMore.module.css'
import { LOAD_MORE } from './types'


export default function LoadMore(props: LOAD_MORE) {



    return (
        <div className={classes.container}>
            {
                props?.loading ? <Loader />
                    :
                    <>
                        {
                            props.hasNextPage &&
                            <button className={classes.Button} onClick={() => { props.setPage(props.page + 1) }}>
                                Load More
                            </button>
                        }
                    </>
            }

        </div>
    )
}