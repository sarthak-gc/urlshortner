// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "../generated/prisma";
import express, { Request, Response } from "express";
import cron from "node-cron";

const app = express();

cron.schedule("* * * * *", async () => {
  const currentTime = new Date(Date.now());
  const prisma = new PrismaClient();
  try {
    const allCodes = await prisma.code.findMany();
    let expiredCodeId: string[] = [];
    allCodes.forEach((code) => {
      const expiredTime = code.expiresAt;
      if (currentTime > expiredTime) {
        expiredCodeId.push(code.id);
      }
    });
    if (expiredCodeId.length > 0) {
      await prisma.code.updateMany({
        where: {
          id: { in: expiredCodeId },
        },
        data: {
          isExpired: true,
        },
      });
    }
  } catch (err) {
    console.log({ status: "error", message: "An unexpected error occurred" });
  }
});

app.use(express.json());
app.post("/generate", async (req: Request, res: Response) => {
  const currentTime = new Date(Date.now());
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const url = req.body.url;
  if (!url.length) {
    res.json({
      message: "Invalid URL",
    });
    return;
  }
  const prisma = new PrismaClient();
  const code = getCode();
  try {
    const workingCode = await prisma.code.create({
      data: {
        code,
        url,
        expiresAt,
        isExpired: false,
        createdAt: currentTime,
      },
    });

    res.json({
      workingCode: workingCode.code,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "An unexpected error occurred" });
    return;
  }
});

app.post("/getUrl", async (req: Request, res: Response) => {
  const code = req.body.code;
  if (!code.length) {
    res.json({
      message: "Invalid URL",
    });
    return;
  }
  const prisma = new PrismaClient();
  try {
    const url = await prisma.code.findFirst({
      where: {
        code,
      },
      select: {
        url: true,
        isExpired: true,
      },
    });
    if (!url) {
      res.json({
        msg: "URL NOT FOUND",
      });
      return;
    }
    if (url.isExpired) {
      res.json({
        msg: "Link expired",
      });
    }
    res.json({
      url: url.url,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "An unexpected error occurred" });
    return;
  }
});
app.listen(4000);

const getCode = () => {
  const length = Math.floor(Math.random() * 3) + 6;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};
