export function getStatus(req, res) {
    console.log("getStatus called");
    console.log("Query params:", req.query);

    const name = req.query.name || "anonymous";

    res.body = {
        status: "ok2",
        hello: `Hi ${name}`
    };
}
