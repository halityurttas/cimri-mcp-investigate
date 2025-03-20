import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import puppeteer from 'puppeteer';
import z from 'zod';

const server = new McpServer({
    name: "Cimri-Price-Investigation",
    version: "1.0.0"
});

server.tool(
    "priceinvestigate",
    { name: z.string() },
    async ({ name }) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        var items = [];
        await page.goto('https://www.cimri.com/arama?q='+name);
        var ps = await page.$$("#opacityLoadingWrapper p");
        await Promise.all(ps.map(async (el) => {
            const innerHTML = await el.evaluate(node => node.innerHTML);
            items.push(innerHTML);
        }));
        await browser.close();
        return {
            content: [{
                type: "text",
                text: `Prices of ${name} are: ${items.join(" - ")}`
            }]
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);