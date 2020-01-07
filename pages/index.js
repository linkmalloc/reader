import React from "react";
import Link from "next/link";
import initFirebase from "../lib/initFirebase";

const db = initFirebase();

const Home = props => {
    console.log(props.books);
    return (
        <ul>
            {props.books.map(v => (
                <li key={v.id}>
                    <Link href="/book/[id]" as={`/book/${v.id}`}>
                        <a>{v.title}</a>
                    </Link>
                </li>
            ))}
        </ul>
    );
};

Home.getInitialProps = async function() {
    let books = new Array();
    let booksRef = db.collection("books");
    let allBooks = (await booksRef.get()).docChanges();

    allBooks.map(book => {
        books.push({
            id: book.doc.id,
            title: book.doc.get("title"),
        });
    });

    return {
        books: books,
    };
};

export default Home;
