export const CONSTANT = {
  AWS_REGION: process.env.AWS_REGION || "ap-southeast-1",
  AWS_SUBNETS: [process.env.AWS_SUBNET_1, process.env.AWS_SUBNET_2, process.env.AWS_SUBNET_3],
  AWS_SECURITY_GROUP_ID: process.env.AWS_SECURITY_GROUP_ID,
};
