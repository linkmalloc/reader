import { useRouter, Router } from "next/router";
import initFirebase from "../../lib/initFirebase";

const loadBook = props => {
    return (
        <div>
            <h1>Book Title: {props.id}</h1>
            <h2>Book ID: {props.id}</h2>
        </div>
    );
};

loadBook.getInitialProps = async function({ query }) {
    const res = await fetch(
        "https://firestore.googleapis.com/v1/projects/bgreader-3f54e/databases/(default)/documents/books/" +
            query.id +
            "/sections/"
    );
    const data = await res.json();

    console.log(`Book` + JSON.stringify(data));

    return query;
};

export default loadBook;
