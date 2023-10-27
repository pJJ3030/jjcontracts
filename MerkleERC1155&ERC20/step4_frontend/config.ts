// Types
type IConfig = {
  decimals: number;
  airdrop: Record<string, number>;
};

// Config from generator
// REMEMBER: all addresses in lowercase
const config: IConfig = {"decimals":18,"airdrop":{"0x1d805bc00b8fa3c96ae6c8fa97b2fd24b19a9801":65.0406504,"0x9f7dfab2222a473284205cddf08a677726d786a0":24.3902439,"0x5210c4dcd7eb899a1274fd6471adec9896ae05aa":8.1300813,"0x6750adbb477d0310f395da2ad93abe4b9bfd1c87":2.43902439}};

// Export config
export default config;
