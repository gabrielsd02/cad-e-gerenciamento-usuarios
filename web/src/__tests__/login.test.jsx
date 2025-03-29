import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
;
import { store } from "@/redux/store";
import Login from '../app/login/page';

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null
    };
  },
}));
 
describe('Login', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
  });

  it('renders a heading', () => { 
    const heading = screen.getByRole("heading", { 
			name: "Login"
		});
 
    expect(heading).toBeInTheDocument()
  })
})